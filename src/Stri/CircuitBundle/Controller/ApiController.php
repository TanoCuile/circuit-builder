<?php

namespace Stri\CircuitBundle\Controller;

use Doctrine\ODM\MongoDB\DocumentManager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Stri\CircuitBundle\Document\Circuit;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ApiController
 * Author Stri <strifinder@gmail.com>
 * @package Stri\CircuitBundle\Controller
 * @Route("/api/circuit")
 */
class ApiController extends  Controller {
    const CIRCUITS_PER_PAGE = 10;

    /**
     * @Route("/preview/{circuitId}", name="api_circuit_preview")
     * @Method({"POST", "PUT"})
     */
    public function savePreview(Request $request, $circuitId) {
        $dm = $this->get('doctrine.odm.mongodb.document_manager');
        $previewData = $request->get('preview_data');
        $circuit = $dm->getRepository('CircuitBundle:Circuit')->find($circuitId);
        $preview = $this->renderView('CircuitBundle:Generic:preview.svg.twig', array(
                'previewData' => $previewData
            ));
        $fs = new Filesystem();
        $circuitPreview = '/uploads/circuit/previews/' . $circuitId . '/';
        $webDir = $this->get('kernel')->getRootDir() . '/../web' . $circuitPreview;
        if (!$fs->exists($webDir)) {
            $fs->mkdir($webDir);
            $fs = new Filesystem();
            try {$fs->chmod($webDir, 0755);} catch (\Symfony\Component\Filesystem\Exception\IOException $e) {}
        }
        $previewFile = $circuitPreview . '/' . $circuit->getRevision() . '.svg';
        file_put_contents($previewFile, $preview);
        return new JsonResponse(array(
            'file' => $previewFile
        ));
    }
    /**
     * @Route("/", name="api_circuit")
     * @Method(methods={"GET", "POST"})
     */
    public function indexAction(Request $request) {
        $dm = $this->get('doctrine.odm.mongodb.document_manager');
        if ($request->getMethod() == $request::METHOD_POST) {
            $data = $request->get('circuit_data');
            if (isset($data['id'])) {
                $circuit = $this->updateCircuit($dm, $data);
            } else {
                $circuit = new Circuit();
                $circuit->jsonUnSerialize($data);
                $dm->persist($circuit);
                $dm->flush();
            }
            return new JsonResponse(array(
                'id' => $circuit->getId()
            ));
        } else {
            $page = $request->get('page', 0);
            $circuits = $dm->getRepository('CircuitBundle:Circuit')->findBy(array('access' => 'public'), array(), self::CIRCUITS_PER_PAGE, self::CIRCUITS_PER_PAGE * $page);

            $circuitsList = array();
            foreach($circuits as $circuit) {
                if ($circuit->getAuthor()) {
                    $author = $circuit->getAuthor()->jsonSerialize();
                } else {
                    $author = array(
                        'id' => 0,
                        'name' => 'Anonymous'
                    );
                }
                $circuitsList[$circuit->getId()] = array(
                    'id' => $circuit->getId(),
                    'name' => $circuit->getName(),
                    'preview' => $circuit->getPreview(),
                    'author' => $author
                );
            }
            return new JsonResponse($circuitsList);
        }
    }

    /**
     * @Route("/{circuitId}", name="api_circuit_manage")
     * @Method(methods={"GET", "PUT", "DELETE"})
     */
    public function circuitAction(Request $request, $circuitId) {
        $dm = $this->get('doctrine.odm.mongodb.document_manager');
        if ($request->getMethod() == $request::METHOD_PUT) {
            $data = $request->get('circuit_data');
            $circuit = $this->updateCircuit($dm, $data);
            return new JsonResponse(array(
                'id' => $circuit->getId()
            ));
        } if($request->getMethod() == $request::METHOD_GET) {
            $circuit = $dm->getRepository('CircuitBundle:Circuit')->find($circuitId);
            $data = $circuit->jsonSerialize();
            return new JsonResponse($data);
        } else if ($request->getMethod() == $request::METHOD_DELETE) {
            $circuit = $dm->getRepository('CircuitBundle:Circuit')->find($circuitId);
            if (
                $circuit->getAuthor()->getId() == $this->getUser()->getId() ||
                $this->get('security.context')->isGranted('ROLE_ADMIN')
            ) {
                $dm->remove($circuit);
                $dm->flush();
            } else {
                return new JsonResponse(array('error' => "You haven't permission"), 403);
            }
            return new JsonResponse(array('status' => 1));
        }
        return new JsonResponse(array(), 404);
    }

    /**
     * @param $dm DocumentManager
     * @param $data array
     * @return Circuit
     */
    protected function updateCircuit($dm, $data)
    {
        $circuit = $dm->getRepository('CircuitBundle:Circuit')->find($data['id']);
        $circuit->jsonUnSerialize($data);
        $dm->merge($circuit);
        $dm->flush();
        return $circuit;
    }
}
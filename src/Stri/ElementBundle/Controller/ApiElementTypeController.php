<?php

namespace Stri\ElementBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ApiController
 * Author Stri <strifinder@gmail.com>
 * @package Stri\ElementBundle\Controller
 * @Route("/api/element_type")
 */
class ApiElementTypeController extends Controller {
    public function saveImagePath($elementType, $view, $fileName, $content){
        $fs = new Filesystem();
        $webDir = $this->get('kernel')->getRootDir() . '/../web' . $fileName;
        if (!$fs->exists($webDir)) {
            $fs->mkdir($webDir);
            $fs = new Filesystem();
            try {$fs->chmod($webDir, 0755);} catch (\Symfony\Component\Filesystem\Exception\IOException $e) {}
        }
        if ($fs->exists($webDir)){
            file_put_contents($webDir, $content);
        } else {
            print '<pre>' . htmlspecialchars(print_r('Fail ' . $webDir . '/' . $fileName,1)) . '</pre>';
        }
    }
    /**
     * @Route("/view/images/rewrite")
     * @Method({"PUT"})
     */
    public function rewriteViewImagesAction(Request $request) {
        if ($viewsData = $request->get('viewsData')) {
            $elementType = $request->get('elementType');
            foreach($viewsData as $view => $images) {
                foreach ($images as $image => $content) {
                    $this->saveImagePath($elementType, $view, $image, $content);
                }
            }
        }
        return new JsonResponse();
    }
    /**
     * @Route("/", name="api_element_type")
     * @Method({"GET", "POST"})
     * @return JsonResponse
     */
    public function indexAction(Request $request) {
        $em = $this->get('doctrine.odm.mongodb.document_manager');
        if ($request->getMethod() == $request::METHOD_POST) {
            $data = $request->request->get('elementType');
            $elementType = new \Stri\ElementBundle\Document\ElementType();
            $elementType->jsonUnSerialize($data);
            $em->persist($elementType);
            $em->flush();
            return new JsonResponse(array('id' => $elementType->getId()));
        } else {
            $elementTypes = $em->getRepository('ElementBundle:ElementType')->findAll();
            $preparedTypes = array();
            foreach ($elementTypes as $type) {
                $preparedTypes[$type->getName()] = $type->jsonSerialize();
            }
            return new JsonResponse($preparedTypes);
        }
    }

    /**
     * @Route("/{elementTypeId}", name="api_element_type_manage")
     * @Method({"GET", "PUT", "DELETE"})
     */
    public function elementTypeAction(Request $request) {
        if ($request->getMethod() == $request::METHOD_PUT) {
            $data = $request->request->get('elementType');
            $em = $this->get('doctrine.odm.mongodb.document_manager');
            $elementType = $em->getRepository('ElementBundle:ElementType')->find($data['id']);
            $elementType->jsonUnSerialize($data);
            $em->merge($elementType);
            $em->flush();
            return new JsonResponse(array('id' => $data['id']));
        } else if ($request->getMethod() == $request::METHOD_GET) {
            return new JsonResponse();
        } else {
            return new JsonResponse();
        }
    }
}
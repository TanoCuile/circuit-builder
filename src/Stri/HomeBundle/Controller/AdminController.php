<?php

namespace Stri\HomeBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class AdminController
 * Author Stri <strifinder@gmail.com>
 * @package Stri\HomeBundle\Controller
 * @Route("/admin")
 */
class AdminController extends Controller {
    /**
     * @Route("/", name="admin_index")
     */
    public function indexAction() {
        return new Response($this->renderView('@Home/Default/admin.html.twig', array()));
    }

    /**
     * @Route("/element_type", name="admin_element_type")
     */
    public function elementTypeAction() {
        return new Response($this->renderView('@Home/Default/admin.html.twig', array()));
    }

    /**
     * @Route("/element_type/{elementTypeId}", name="admin_element_type_manage")
     */
    public function elementTypeManageAction() {
        return new Response($this->renderView('@Home/Default/admin.html.twig', array()));
    }

    /**
     * @Route("/file/element_type", name="upload_file")
     * @Method(methods={"POST", "DELETE"})
     */
    public function fileUploadElementAction(Request $request) {
        if ( !empty($request->files) ) {
            $fs = new Filesystem();
            $elementTypeDir = '/uploads/elements/' . $request->get('elementType');
            $webDir = $this->get('kernel')->getRootDir() . '/../web' . $elementTypeDir;
            if (!$fs->exists($webDir)) {
                $fs->mkdir($webDir);
                $fs = new Filesystem();
                try {$fs->chmod($webDir, 0755);} catch (\Symfony\Component\Filesystem\Exception\IOException $e) {}
            }
            /** @var \Symfony\Component\HttpFoundation\File\UploadedFile $file */
            $file = $request->files->get('file');
            $file->move($webDir, $file->getClientOriginalName());
            try {$fs->chmod($webDir . '/' . $file->getClientOriginalName(), 0755);} catch (\Symfony\Component\Filesystem\Exception\IOException $e) {}

            return new JsonResponse(array('status' => 1, 'file' => $elementTypeDir . '/' . $file->getClientOriginalName()));
        } else {
            return new JsonResponse(array('status' => 0));
        }
    }

    /**
     * @Route("/file/preview", name="upload_preview_file")
     * @Method(methods={"POST", "DELETE"})
     */
    public function fileUploadPreviewAction(Request $request) {
        if ( !empty($request->files) ) {
            $fs = new Filesystem();
            $elementTypeDir = '/uploads/elements/views/' . $request->get('elementType');
            $webDir = $this->get('kernel')->getRootDir() . '/../web' . $elementTypeDir;
            if (!$fs->exists($webDir)) {
                $fs->mkdir($webDir);
                $fs = new Filesystem();
                try {$fs->chmod($webDir, 0755);} catch (\Symfony\Component\Filesystem\Exception\IOException $e) {}
            }
            /** @var \Symfony\Component\HttpFoundation\File\UploadedFile $file */
            $file = $request->files->get('file');
            $file->move($webDir, $file->getClientOriginalName());
            try {$fs->chmod($webDir . '/' . $file->getClientOriginalName(), 0755);} catch (\Symfony\Component\Filesystem\Exception\IOException $e) {}

            return new JsonResponse(array('status' => 1, 'file' => $elementTypeDir . '/' . $file->getClientOriginalName()));
        } else {
            return new JsonResponse(array('status' => 0));
        }
    }
}
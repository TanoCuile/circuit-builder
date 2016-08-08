<?php

namespace Stri\ElementBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * Class ApiElementController
 * Author Stri <strifinder@gmail.com>
 * @package Stri\ElementBundle\Controller
 * @Route("/api/element")
 */
class ApiElementController extends Controller {
    /**
     * @Route("/", name="api_element")
     * @Method(methods={"GET", "POST"})
     * @return JsonResponse
     */
    public function indexAction(){
        return new JsonResponse();
    }

    /**
     * @Route("/{elemntId}", name="api_element_manage")
     * @Method(methods={"GET", "PUT", "DELETE"})
     * @return JsonResponse
     */
    public function elementAction() {
        return new JsonResponse();
    }
}
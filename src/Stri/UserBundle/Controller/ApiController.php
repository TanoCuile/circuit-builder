<?php

namespace Stri\UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ApiController
 * Author Stri <strifinder@gmail.com>
 * @package Stri\UserBundle\Controller
 * @Route("/api/user")
 */
class ApiController extends Controller {
    /**
     * @param Request $request
     * @Route("/", name="api_user")
     * @Method({"GET"})
     */
    public function indexAction(Request $request){
        if ($user = $this->getUser()) {
            return new JsonResponse($user);
        } else {
            return new JsonResponse(array('name' => 'Anonymous', 'id' => 0));
        }
    }
    public function userAction(Request $request){

    }
}
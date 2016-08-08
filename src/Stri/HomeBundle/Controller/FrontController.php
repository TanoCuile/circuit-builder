<?php

namespace Stri\HomeBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;

class FrontController extends Controller {
    /**
     * @Route("/", name="home")
     */
    function homeAction(){
        return new Response($this->renderView('@Home/Default/index.html.twig', array()));
    }

    /**
     * @Route("/circuits", name="circuits")
     */
    function circuitsAction() {
        return new Response($this->renderView('@Home/Default/index.html.twig', array()));
    }

    /**
     * @Route("circuits/new", name="new_circuit")
     */
    function newCircuitAction(){
        return new Response($this->renderView('@Home/Default/index.html.twig', array()));
    }

    /**
     * @Route("/circuits/{circuitId}/delete", name="delete_circuit")
     */
    function deleteCircuitAction() {
        return new Response($this->renderView('@Home/Default/index.html.twig', array()));
    }

    /**
     * @Route("circuits/{circuitId}", name="edit_circuit")
     */
    function circuitAction() {
        return new Response($this->renderView('@Home/Default/index.html.twig', array()));
    }
}
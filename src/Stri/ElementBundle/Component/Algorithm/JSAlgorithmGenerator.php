<?php

namespace Stri\ElementBundle\Component\Algorithm;

use Stri\ElementBundle\Entity\ElementType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Bundle\TwigBundle\TwigEngine;

class JSAlgorithmGenerator extends Controller {
    /** @var TwigEngine */
    protected $templateEngine;

    public function __controller(TwigEngine $templateEngine) {
        $this->templateEngine = $templateEngine;
    }

    public function generateAlgorithm(Algorithm $algorithm, ElementType $type) {
        $typesDir = $this->get('kernel')->locateResource('@ElementBundle/Resources/public/element_type/types/');

        file_put_contents($typesDir . $type->getMachineName() . '.js', $this->templateEngine->render('ElementBundle:ElementType:element_type_layout.js.twig', array(
                    'algorithm' => $algorithm,
                    'type' => $type
                )));

        return true;
    }
}
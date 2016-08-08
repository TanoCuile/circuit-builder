<?php

namespace Stri\CircuitBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;
use Stri\ElementBundle\Document\ElementTypeArea;

/**
 * Class CircuitType
 * Author Stri <strifinder@gmail.com>
 * @package Stri\CircuitBundle\Document
 * @MongoDB\Document(collection="circuit_type")
 */
class CircuitType {
    /**
     * @var string
     * @MongoDB\Id()
     */
    protected $id;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $name;

    /**
     * @var ElementTypeArea[]
     * @MongoDB\ReferenceMany(targetDocument="Stri\ElementBundle\Document\ElementTypeArea")
     */
    protected $elements;

    /**
     * @param \Stri\ElementBundle\Document\ElementTypeArea[] $elements
     *
     * @return $this
     */
    public function setElements($elements)
    {
        $this->elements = $elements;
        return $this;
    }

    /**
     * @return \Stri\ElementBundle\Document\ElementTypeArea[]
     */
    public function getElements()
    {
        return $this->elements;
    }

    /**
     * @param string $id
     *
     * @return $this
     */
    public function setId($id)
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param string $name
     *
     * @return $this
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }


}
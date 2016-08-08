<?php

namespace Stri\ElementBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * Class ElementType
 * Author Stri <strifinder@gmail.com>
 * @package Stri\ElementBundle\Document
 * @MongoDB\Document(collection="element_types")
 */
class ElementType implements \JsonSerializable {
    /**
     * @var integer
     * @MongoDB\Id(strategy="auto")
     */
    protected $id;

    /**
     * @var ElementTypeView[]
     * @MongoDB\EmbedMany(targetDocument="ElementTypeView")
     */
    protected $views;

    /**
     * @var ElementTypeArea
     * @MongoDB\ReferenceOne(targetDocument="ElementTypeArea")
     */
    protected $area;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $role;

    /**
     * @var string()
     * @MongoDB\String()
     */
    protected $machineName;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $name;

    /**
     * @var array
     * @MongoDB\Raw()
     */
    protected $previews;

    /**
     * @var Algorithm[]
     * @MongoDB\EmbedMany(targetDocument="Algorithm")
     */
    protected $algorithms = array();

    /**
     * @var Parameter[]
     * @MongoDB\EmbedMany(targetDocument="Parameter")
     */
    protected $parameters = array();

    /**
     * @param int $id
     *
     * @return $this
     */
    public function setId($id)
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param string $role
     *
     * @return $this
     */
    public function setRole($role)
    {
        $this->role = $role;
        return $this;
    }

    /**
     * @return string
     */
    public function getRole()
    {
        return $this->role;
    }

    /**
     * @param \Stri\ElementBundle\Document\ElementTypeArea $area
     *
     * @return $this
     */
    public function setArea($area)
    {
        $this->area = $area;
        return $this;
    }

    /**
     * @return \Stri\ElementBundle\Document\ElementTypeArea
     */
    public function getArea()
    {
        return $this->area;
    }

    /**
     * @param string $machineName
     *
     * @return $this
     */
    public function setMachineName($machineName)
    {
        $this->machineName = $machineName;
        return $this;
    }

    /**
     * @return string
     */
    public function getMachineName()
    {
        return $this->machineName;
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

    /**
     * @param array $previews
     *
     * @return $this
     */
    public function setPreviews($previews)
    {
        $this->previews = $previews;
        return $this;
    }

    /**
     * @return array
     */
    public function getPreviews()
    {
        return $this->previews;
    }

    /**
     * @param \Stri\ElementBundle\Document\ElementTypeView[] $views
     *
     * @return $this
     */
    public function setViews($views)
    {
        $this->views = $views;
        return $this;
    }

    /**
     * @return \Stri\ElementBundle\Document\ElementTypeView[]
     */
    public function getViews()
    {
        return $this->views;
    }

    /**
     * @param \Stri\ElementBundle\Document\Algorithm[] $algorithms
     *
     * @return $this
     */
    public function setAlgorithms($algorithms)
    {
        $this->algorithms = $algorithms;
        return $this;
    }

    /**
     * @return \Stri\ElementBundle\Document\Algorithm[]
     */
    public function getAlgorithms()
    {
        return $this->algorithms;
    }

    /**
     * @param \Stri\ElementBundle\Document\Parameter[] $parameters
     *
     * @return $this
     */
    public function setParameters($parameters)
    {
        $this->parameters = $parameters;
        return $this;
    }

    /**
     * @return \Stri\ElementBundle\Document\Parameter[]
     */
    public function getParameters()
    {
        return $this->parameters;
    }

    public function jsonUnSerialize($data){
        $this->setName($data['name']);
        $this->setMachineName($data['machineName']);
        $this->setRole($data['role']);
        $this->setPreviews($data['previews']);
        $parameters = array();
        foreach ($data['parameters'] as $key => $param) {
            $parameters[$key] = (new Parameter())->jsonUnSerialize($param);
        }
        $this->setParameters($parameters);

        $algorithms = array();
        foreach($data['algorithm'] as $name => $algorithm){
            $algorithms[] = (new Algorithm())->jsonUnSerialize(array(
                'name' => $name,
                'algorithm' => $algorithm
            ));
        }
        $this->setAlgorithms($algorithms);

        $views = array();
        foreach($data['views'] as $viewData){
            $views[] = (new ElementTypeView())->jsonUnSerialize($viewData);
        }
        $this->setViews($views);
        return $this;
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     */
    public function jsonSerialize()
    {
        $algorithms = array();
        foreach($this->getAlgorithms() as $algorithm) {
            $algorithms[$algorithm->getAlgorithmName()] = $algorithm->jsonSerialize();
        }
        $parameters = array();
        foreach ($this->getParameters() as $parameter) {
            $parameters[$parameter->getMachineName()] = $parameter->jsonSerialize();
        }
        $views = array();
        foreach($this->getViews() as $view){
            $views[$view->getName()] = $view->jsonSerialize();
        }
        return array(
            'id' => $this->getId(),
            'name' => $this->getName(),
            'previews' => $this->getPreviews(),
            'machineName' => $this->getMachineName(),
            'parameters' => $parameters,
            'algorithm' => $algorithms,
            'role' => $this->getRole(),
            'views' => $views
        );
    }
}
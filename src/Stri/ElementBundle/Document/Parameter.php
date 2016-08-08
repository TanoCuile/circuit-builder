<?php

namespace Stri\ElementBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * Class Parameter
 * Author Stri <strifinder@gmail.com>
 * @package Stri\ElementBundle\Document
 * @MongoDB\EmbeddedDocument()
 */
class Parameter implements \JsonSerializable {
    /**
     * @var string
     * @MongoDB\String()
     */
    protected $machineName;
    /**
     * @var string
     * @MongoDB\String()
     */
    protected $label;
    /**
     * @var string
     * @MongoDB\String()
     */
    protected $type;
    /**
     * @var mixed
     * @MongoDB\Raw()
     */
    protected $defaultValue;
    /**
     * @var array
     * @MongoDB\Raw()
     */
    protected $options;
    /**
     * @var array
     * @MongoDB\Raw()
     */
    protected $additional;

    /**
     * @param array $additional
     *
     * @return $this
     */
    public function setAdditional($additional)
    {
        $this->additional = $additional;
        return $this;
    }

    /**
     * @return array
     */
    public function getAdditional()
    {
        return $this->additional;
    }

    /**
     * @param mixed $defaultValue
     *
     * @return $this
     */
    public function setDefaultValue($defaultValue)
    {
        $this->defaultValue = $defaultValue;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDefaultValue()
    {
        return $this->defaultValue;
    }

    /**
     * @param string $label
     *
     * @return $this
     */
    public function setLabel($label)
    {
        $this->label = $label;
        return $this;
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
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
     * @param array $options
     *
     * @return $this
     */
    public function setOptions($options)
    {
        $this->options = $options;
        return $this;
    }

    /**
     * @return array
     */
    public function getOptions()
    {
        return $this->options;
    }

    /**
     * @param string $type
     *
     * @return $this
     */
    public function setType($type)
    {
        $this->type = $type;
        return $this;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    public function jsonUnSerialize($data){
        $this->setLabel($data['label']);
        $this->setMachineName($data['machineName']);
        $this->setAdditional($data['additional']);
        $this->setDefaultValue($data['defaultValue']);
        $this->setOptions($data['options']);
        $this->setType($data['type']);
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
        return array(
            'machineName' => $this->getMachineName(),
            'label' => $this->getLabel(),
            'additional' => $this->getAdditional(),
            'defaultValue' => $this->getDefaultValue(),
            'options' => $this->getOptions(),
            'type' => $this->getType()
        );
    }
}
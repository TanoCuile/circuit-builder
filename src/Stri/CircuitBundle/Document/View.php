<?php

namespace Stri\CircuitBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * Class View
 * Author Stri <strifinder@gmail.com>
 * @package Stri\CircuitBundle\Document
 * @MongoDB\EmbeddedDocument()
 */
class View implements \JsonSerializable {
    /**
     * @var string
     * @MongoDB\String()
     */
    protected $type;

    /**
     * @var string
     * @MongoDB\Raw()
     */
    protected $source;

    /**
     * @var string
     * @MongoDB\Raw()
     */
    protected $properties;

    /**
     * @var array
     * @MongoDB\Raw()
     */
    protected $data;

    /**
     * @param array $data
     *
     * @return $this
     */
    public function setData($data)
    {
        $this->data = $data;
        return $this;
    }

    /**
     * @return array
     */
    public function getData()
    {
        return $this->data;
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

    /**
     * @param string $source
     *
     * @return $this
     */
    public function setSource($source)
    {
        $this->source = $source;
        return $this;
    }

    /**
     * @return string
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * @param string $properties
     *
     * @return $this
     */
    public function setProperties($properties)
    {
        $this->properties = $properties;
        return $this;
    }

    /**
     * @return string
     */
    public function getProperties()
    {
        return $this->properties;
    }

    public function jsonUnSerialize($data){
        $this->setType($data['type']);
        $this->setData($data['data']);
        $this->setProperties($data['properties']);
        $this->setSource($data['source']);
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
            'type' => $this->getType(),
            'data' => $this->getData(),
            'properties' => $this->getProperties(),
            'source' => $this->getSource()
        );
    }
}
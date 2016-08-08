<?php

namespace Stri\ElementBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * Class Connection
 * Author Stri <strifinder@gmail.com>
 * @package Stri\ElementBundle\Document
 * @MongoDB\EmbeddedDocument()
 */
class Connection implements \JsonSerializable {
    /**
     * @var string
     * @MongoDB\String()
     */
    protected $source;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $goal;

    /**
     * @var array
     * @MongoDB\Raw()
     */
    protected $path;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $id;

    /**
     * @var array
     * @MongoDB\Raw()
     */
    protected $properties;

    /**
     * @param string $goal
     *
     * @return $this
     */
    public function setGoal($goal)
    {
        $this->goal = $goal;
        return $this;
    }

    /**
     * @return string
     */
    public function getGoal()
    {
        return $this->goal;
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
     * @param array $path
     *
     * @return $this
     */
    public function setPath($path)
    {
        $this->path = $path;
        return $this;
    }

    /**
     * @return array
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * @param array $properties
     *
     * @return $this
     */
    public function setProperties($properties)
    {
        $this->properties = $properties;
        return $this;
    }

    /**
     * @return array
     */
    public function getProperties()
    {
        return $this->properties;
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

    public function jsonUnSerialize($data){
        $this->setGoal($data['goal']);
        $this->setSource($data['source']);
        $this->setId($data['id']);
        $this->setPath($data['path']);
        $this->setProperties($data['properties']);
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
            'goal' => $this->getGoal(),
            'source' => $this->getSource(),
            'id' => $this->getId(),
            'properties' => $this->getProperties(),
            'path' => $this->getPath()
        );
    }
}
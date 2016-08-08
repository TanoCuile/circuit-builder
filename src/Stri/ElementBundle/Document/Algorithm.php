<?php

namespace Stri\ElementBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;
use Doctrine\ORM\Mapping\ManyToOne;

/**
 * Class Algorithm
 * Author Stri <strifinder@gmail.com>
 * @package Stri\ElementBundle\Document
 * @MongoDB\EmbeddedDocument()
 */
class Algorithm implements \JsonSerializable {
    /**
     * @var string
     * @MongoDB\String(name="algorithmName")
     */
    protected $algorithmName;

    /**
     * @var string
     * @MongoDB\String(name="algorithm")
     */
    protected $algorithm;

    /**
     * @param string $algorithm
     *
     * @return $this
     */
    public function setAlgorithm($algorithm)
    {
        $this->algorithm = $algorithm;
        return $this;
    }

    /**
     * @return string
     */
    public function getAlgorithm()
    {
        return $this->algorithm;
    }

    /**
     * @param string $algorithmName
     *
     * @return $this
     */
    public function setAlgorithmName($algorithmName)
    {
        $this->algorithmName = $algorithmName;
        return $this;
    }

    /**
     * @return string
     */
    public function getAlgorithmName()
    {
        return $this->algorithmName;
    }

    public function jsonUnSerialize($data) {
        $this->setAlgorithmName($data['name']);
        $this->setAlgorithm($data['algorithm']);
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
        return $this->getAlgorithm();
    }
}
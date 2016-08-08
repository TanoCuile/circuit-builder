<?php

namespace Stri\ElementBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * Class ElementModel
 * Author Stri <strifinder@gmail.com>
 * @package Stri\ElementBundle\Document
 * @MongoDB\EmbeddedDocument()
 */
class ElementModel implements \JsonSerializable {
    /**
     * @var string
     * @MongoDB\String()
     */
    protected $articleCode;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $manufacturer;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $type;

    /**
     * @var float
     * @MongoDB\Float()
     */
    protected $weight;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $size;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $title;

    /**
     * @param string $articleCode
     *
     * @return $this
     */
    public function setArticleCode($articleCode)
    {
        $this->articleCode = $articleCode;
        return $this;
    }

    /**
     * @return string
     */
    public function getArticleCode()
    {
        return $this->articleCode;
    }

    /**
     * @param string $manufacturer
     *
     * @return $this
     */
    public function setManufacturer($manufacturer)
    {
        $this->manufacturer = $manufacturer;
        return $this;
    }

    /**
     * @return string
     */
    public function getManufacturer()
    {
        return $this->manufacturer;
    }

    /**
     * @param string $size
     *
     * @return $this
     */
    public function setSize($size)
    {
        $this->size = $size;
        return $this;
    }

    /**
     * @return string
     */
    public function getSize()
    {
        return $this->size;
    }

    /**
     * @param string $title
     *
     * @return $this
     */
    public function setTitle($title)
    {
        $this->title = $title;
        return $this;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
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
     * @param float $weight
     *
     * @return $this
     */
    public function setWeight($weight)
    {
        $this->weight = $weight;
        return $this;
    }

    /**
     * @return float
     */
    public function getWeight()
    {
        return $this->weight;
    }

    public function jsonUnSerialize($data) {
        if (isset($data['title']))
            $this->setTitle($data['title']);
        if (isset($data['type']))
            $this->setType($data['type']);
        if (isset($data['articleCode']))
            $this->setArticleCode($data['articleCode']);
        if (isset($data['manufacturer']))
            $this->setManufacturer($data['manufacturer']);
        if (isset($data['size']))
            $this->setSize($data['size']);
        if (isset($data['weight']))
            $this->setWeight($data['weight']);
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
            'articleCode' => $this->getArticleCode(),
            'type' => $this->getType(),
            'title' => $this->getTitle(),
            'manufacturer' => $this->getManufacturer(),
            'size' => $this->getSize(),
            'weight' => $this->getWeight(),
        );
    }
}
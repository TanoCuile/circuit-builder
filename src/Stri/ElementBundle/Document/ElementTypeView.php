<?php

namespace Stri\ElementBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;
use Doctrine\ORM\Mapping\ManyToOne;

/**
 * Class ElementTypeView
 * Author Stri <strifinder@gmail.com>
 * @package Stri\ElementBundle\Document
 * @MongoDB\EmbeddedDocument()
 */
class ElementTypeView implements \JsonSerializable {
    /**
     * @var string
     * @MongoDB\String()
     */
    protected $name;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $image;

    /**
     * @var array
     * @MongoDB\Raw()
     */
    protected $images;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $label;

    /**
     * @var ActivePoint[]
     * @MongoDB\EmbedMany(targetDocument="Stri\ElementBundle\Document\ActivePoint")
     */
    protected $ports = array();

    /**
     * @var ActivePoint[]
     * @MongoDB\EmbedMany(targetDocument="Stri\ElementBundle\Document\ActivePoint")
     */
    protected $activePoints;

    /**
     * @var float
     * @MongoDB\Float()
     */
    protected $width;

    /**
     * @var float
     * @MongoDB\Float()
     */
    protected $height;

    /**
     * @var array
     * @MongoDB\Raw()
     */
    protected $details;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $shortCut;

    /**
     * @var float
     * @MongoDB\Float()
     */
    protected $shortCutX;

    /**
     * @var float
     * @MongoDB\Float()
     */
    protected $shortCutY;

    /**
     * @param ActivePoint[ $activePoints
     *
     * @return $this
     */
    public function setActivePoints($activePoints)
    {
        $this->activePoints = $activePoints;
        return $this;
    }

    /**
     * @return ActivePoint[
     */
    public function getActivePoints()
    {
        return $this->activePoints;
    }

    /**
     * @param array $details
     *
     * @return $this
     */
    public function setDetails($details)
    {
        $this->details = $details;
        return $this;
    }

    /**
     * @return array
     */
    public function getDetails()
    {
        return $this->details;
    }


    /**
     * @param string $image
     *
     * @return $this
     */
    public function setImage($image)
    {
        $this->image = $image;
        return $this;
    }

    /**
     * @return string
     */
    public function getImage()
    {
        return $this->image;
    }

    /**
     * @param array $images
     *
     * @return $this
     */
    public function setImages($images)
    {
        $this->images = $images;
        return $this;
    }

    /**
     * @return array
     */
    public function getImages()
    {
        return $this->images;
    }

    /**
     * @param mixed $height
     *
     * @return $this
     */
    public function setHeight($height)
    {
        $this->height = $height;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getHeight()
    {
        return $this->height;
    }

    /**
     * @param mixed $label
     *
     * @return $this
     */
    public function setLabel($label)
    {
        $this->label = $label;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * @param mixed $name
     *
     * @return $this
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param ActivePoint[ $ports
     *
     * @return $this
     */
    public function setPorts($ports)
    {
        $this->ports = $ports;
        return $this;
    }

    /**
     * @return ActivePoint[]
     */
    public function getPorts()
    {
        return $this->ports;
    }

    /**
     * @param mixed $shortcut
     *
     * @return $this
     */
    public function setShortCut($shortcut)
    {
        $this->shortCut = $shortcut;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getShortCut()
    {
        return $this->shortCut;
    }

    /**
     * @param mixed $width
     *
     * @return $this
     */
    public function setWidth($width)
    {
        $this->width = $width;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getWidth()
    {
        return $this->width;
    }

    /**
     * @param mixed $shortCutX
     *
     * @return $this
     */
    public function setShortCutX($shortCutX)
    {
        $this->shortCutX = $shortCutX;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getShortCutX()
    {
        return $this->shortCutX;
    }

    /**
     * @param mixed $shortCutY
     *
     * @return $this
     */
    public function setShortCutY($shortCutY)
    {
        $this->shortCutY = $shortCutY;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getShortCutY()
    {
        return $this->shortCutY;
    }

    public function jsonUnSerialize($data){
        $this->setName($data['name']);
        $this->setLabel($data['label']);
        $this->setShortcut($data['shortCut']['title']);
        $this->setShortCutX($data['shortCut']['position']['x']);
        $this->setShortCutY($data['shortCut']['position']['y']);
        $this->setWidth($data['size']['width']);
        $this->setHeight($data['size']['height']);
        $this->setImage($data['image']);
        $this->setImages($data['images']);
        $this->setDetails($data['details']);
        $ports = array();
        foreach ($data['ports'] as $port) {
            $ports[] = (new ActivePoint())->jsonUnSerialize($port);
        }
        $this->setPorts($ports);

        $activePoints = array();
        foreach ($data['activePoints'] as $activePoint) {
            $activePoints[] = (new ActivePoint())->jsonUnSerialize($activePoint);
        }
        $this->setActivePoints($activePoints);
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
        $ports = array();
        foreach ($this->getPorts() as $port) {
            $ports[] = $port->jsonSerialize();
        }
        $activePoints = array();
        foreach($this->getActivePoints() as $activePoint){
            $activePoints[] = $activePoint->jsonSerialize();
        }
        return array(
            'name' => $this->getName(),
            'label' => $this->getLabel(),
            'images' => $this->getImages(),
            'details' => $this->getDetails() ? $this->getDetails() : array(),
            'image' => $this->getImage(),
            'shortCut' => array(
                'title' => $this->getShortcut(),
                'position' => array(
                    'x' => $this->getShortCutX(),
                    'y' => $this->getShortCutY()
                )
            ),
            'size' => array(
                'width' => $this->getWidth(),
                'height' => $this->getHeight()
            ),
            'ports' => $ports,
            'activePoints' => $activePoints
        );
    }
}
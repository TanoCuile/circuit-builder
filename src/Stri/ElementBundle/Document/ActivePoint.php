<?php

namespace Stri\ElementBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * Class ActivePoint
 * Author Stri <strifinder@gmail.com>
 * @package Stri\ElementBundle\Document
 * @MongoDB\EmbeddedDocument()
 */
class ActivePoint implements \JsonSerializable
{
    /**
     * @var string
     * @MongoDB\String()
     */
    protected $id;

    /**
     * @var float
     * @MongoDB\Float()
     */
    protected $x;

    /**
     * @var float
     * @MongoDB\Float()
     */
    protected $y;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $dir;

    /**
     * @var Algorithm
     * @MongoDB\EmbedOne(targetDocument="Algorithm")
     */
    protected $callback;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $role;

    /**
     * @param Algorithm $callback
     *
     * @return $this
     */
    public function setCallback($callback)
    {
        $this->callback = $callback;
        return $this;
    }

    /**
     * @return Algorithm
     */
    public function getCallback()
    {
        return $this->callback;
    }

    /**
     * @param string $dir
     *
     * @return $this
     */
    public function setDir($dir)
    {
        $this->dir = $dir;
        return $this;
    }

    /**
     * @return string
     */
    public function getDir()
    {
        return $this->dir;
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
     * @param float $x
     *
     * @return $this
     */
    public function setX($x)
    {
        $this->x = $x;
        return $this;
    }

    /**
     * @return float
     */
    public function getX()
    {
        return $this->x;
    }

    /**
     * @param float $y
     *
     * @return $this
     */
    public function setY($y)
    {
        $this->y = $y;
        return $this;
    }

    /**
     * @return float
     */
    public function getY()
    {
        return $this->y;
    }

    public function jsonUnSerialize($data)
    {
        $this->setRole($data['role']);
        $this->setId($data['id']);
        $this->setX($data['x']);
        $this->setY($data['y']);
        $this->setDir($data['dir']);
        if ($this->getCallback()) {
            $this->getCallback()->setAlgorithm($data['callback']);
        } else {
            $this->setCallback(
                (new Algorithm())->jsonUnSerialize(
                    array(
                        'algorithm' => $data['callback'],
                        'name' => 'test'
                    )
                )
            );
        }
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
            'id' => $this->getId(),
            'callback' => $this->getCallback()->getAlgorithm(),
            'x' => $this->getX(),
            'y' => $this->getY(),
            'dir' => $this->getDir(),
            'role' => $this->getRole()
        );
    }
}
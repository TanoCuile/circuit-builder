<?php

namespace Stri\UserBundle\Document;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * Class User
 * Author Stri <strifinder@gmail.com>
 * @package Stri\UserBundle\Document
 * @MongoDB\Document(collection="users")
 */
class User extends BaseUser implements \JsonSerializable {
    /**
     * @var integer
     * @MongoDB\Id(strategy="auto")
     */
    protected $id;

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
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
            'name' => $this->getUsername(),
        );
    }
}
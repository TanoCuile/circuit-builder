<?php

namespace Stri\CircuitBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;
use Doctrine\ORM\Mapping\ManyToOne;
use Stri\ElementBundle\Document\Connection;
use Stri\ElementBundle\Document\Element;
use Stri\UserBundle\Document\User;


/**
 * Class Circuit
 * Author Stri <strifinder@gmail.com>
 * @package Stri\CircuitBundle\Document
 * @MongoDB\Document(collection="circuit")
 */
class Circuit implements \JsonSerializable {
    /**
     * @var string
     * @MongoDB\Id(strategy="auto")
     */
    protected $id;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $name;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $description;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $access;

    /**
     * @var integer
     * @MongoDB\Integer()
     */
    protected $revision;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $preview;

    /**
     * @var User
     * @MongoDB\ReferenceOne(targetDocument="Stri\UserBundle\Document\User")
     */
    protected $author;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $type;

    /**
     * @var Element[]
     * @MongoDB\EmbedMany(targetDocument="Stri\ElementBundle\Document\Element")
     */
    protected $elements;

    /**
     * @var Connection[]
     * @MongoDB\EmbedMany(targetDocument="Stri\ElementBundle\Document\Connection")
     */
    protected $connections;

    /**
     * @var View[]
     * @MongoDB\EmbedMany(targetDocument="View")
     */
    protected $views;

    /**
     * @param \Stri\UserBundle\Document\User $author
     *
     * @return $this
     */
    public function setAuthor($author)
    {
        $this->author = $author;
        return $this;
    }

    /**
     * @return \Stri\UserBundle\Document\User
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * @param \Stri\ElementBundle\Document\Connection[] $connections
     *
     * @return $this
     */
    public function setConnections($connections)
    {
        $this->connections = $connections;
        return $this;
    }

    /**
     * @return \Stri\ElementBundle\Document\Connection[]
     */
    public function getConnections()
    {
        return $this->connections;
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
     * @param string $description
     *
     * @return $this
     */
    public function setDescription($description)
    {
        $this->description = $description;
        return $this;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @param int $revision
     *
     * @return $this
     */
    public function setRevision($revision)
    {
        $this->revision = $revision;
        return $this;
    }

    /**
     * @return int
     */
    public function getRevision()
    {
        return $this->revision;
    }

    /**
     * @param string $preview
     *
     * @return $this
     */
    public function setPreview($preview)
    {
        $this->preview = $preview;
        return $this;
    }

    /**
     * @return string
     */
    public function getPreview()
    {
        return $this->preview;
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
     * @param \Stri\CircuitBundle\Document\View[] $views
     *
     * @return $this
     */
    public function setViews($views)
    {
        $this->views = $views;
        return $this;
    }

    /**
     * @return \Stri\CircuitBundle\Document\View[]
     */
    public function getViews()
    {
        return $this->views;
    }

    /**
     * @param \Stri\ElementBundle\Document\Element[] $elements
     *
     * @return $this
     */
    public function setElements($elements)
    {
        $this->elements = $elements;
        return $this;
    }

    /**
     * @return \Stri\ElementBundle\Document\Element[]
     */
    public function getElements()
    {
        return $this->elements;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param boolean $access
     *
     * @return $this
     */
    public function setAccess($access)
    {
        $this->access = $access;
        return $this;
    }

    /**
     * @return boolean
     */
    public function getAccess()
    {
        return $this->access;
    }

    /**
     * todo: Load Author
     * @param $data
     * @return $this
     */
    public function jsonUnSerialize($data){
        if (isset($data['id'])) {
            $this->id = $data['id'];
        }
        $this->setName($data['name']);
        $this->setType($data['type']);
        $this->setRevision($data['revision']);
        $this->setDescription($data['description']);
        $this->setAccess($data['access']);

        if (isset($data['author'])) {
            $this->setAuthor($data['author']);
        }
        $connections = array();
        if ($data['connections']){
            foreach($data['connections'] as $connection){
                $connections[] = (new Connection())->jsonUnSerialize($connection);
            }
        }
        $this->setConnections($connections);

        $elements = array();
        if ($data['elements']) {
            foreach($data['elements'] as $element){
                $elements[] = (new Element())->jsonUnSerialize($element);
            }
        }
        $this->setElements($elements);

        $views = array();
        if ($data['views']) {
            foreach($data['views'] as $view){
                $views[] = (new View())->jsonUnSerialize($view);
            }
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
        $elements = array();
        foreach($this->getElements() as $element){
            $elements[] = $element->jsonSerialize();
        }
        $connections = array();
        foreach($this->getConnections() as $connection){
            $connections[] = $connection->jsonSerialize();
        }
        $views = array();
        foreach($this->getViews() as $view){
            $views[] = $view->jsonSerialize();
        }
        if ($this->getAuthor()) {
            $authorId = $this->getAuthor()->getId();
        } else {
            $authorId = 0;
        }
        return array(
            'id' => $this->getId(),
            'name' => $this->getName(),
            'description' => $this->getDescription(),
            'revision' => $this->getRevision(),
            'author' => $authorId,
            'type' => $this->getType(),
            'elements' => $elements,
            'access' => $this->getAccess(),
            'connections' => $connections,
            'views' => $views
        );
    }
}
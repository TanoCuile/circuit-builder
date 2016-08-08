<?php
namespace Stri\ElementBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;
use MongoDBODMProxies\__CG__\Stri\ElementBundle\Document\ElementModel;

/**
 * Class Element
 * Author Stri <strifinder@gmail.com>
 * @package Stri\ElementBundle\Documen
 * @MongoDB\EmbeddedDocument()
 */
class Element implements \JsonSerializable {
    /**
     * @var string
     * @MongoDB\String()
     */
    protected $id;

    /**
     * @var string
     * @MongoDB\String()
     */
    protected $type;

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
     * @var array
     * @MongoDB\Raw()
     */
    protected $stage;

    /**
     * @var ElementModel
     * @MongoDB\EmbedOne(targetDocument="ElementModel")
     */
    protected $model;

    /**
     * @var array
     * @MongoDB\Raw()
     */
    protected $parameters;

    /**
     * @var integer
     * @MongoDB\Integer()
     */
    protected $rotation;

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
     * @var array
     * @MongoDB\Raw()
     */
    protected $ports;

    /**
     * @var array
     * @MongoDB\Raw()
     */
    protected $activePoints;

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
     * @param \Stri\ElementBundle\Document\ElementModel $model
     *
     * @return $this
     */
    public function setModel($model)
    {
        $this->model = $model;
        return $this;
    }

    /**
     * @return \Stri\ElementBundle\Document\ElementModel
     */
    public function getModel()
    {
        return $this->model;
    }

    /**
     * @param array $parameters
     *
     * @return $this
     */
    public function setParameters($parameters)
    {
        $this->parameters = $parameters;
        return $this;
    }

    /**
     * @return array
     */
    public function getParameters()
    {
        return $this->parameters;
    }

    /**
     * @param int $rotation
     *
     * @return $this
     */
    public function setRotation($rotation)
    {
        $this->rotation = $rotation;
        return $this;
    }

    /**
     * @return int
     */
    public function getRotation()
    {
        return $this->rotation;
    }

    /**
     * @param string $shortCut
     *
     * @return $this
     */
    public function setShortCut($shortCut)
    {
        $this->shortCut = $shortCut;
        return $this;
    }

    /**
     * @return string
     */
    public function getShortCut()
    {
        return $this->shortCut;
    }

    /**
     * @param float $shortCutX
     *
     * @return $this
     */
    public function setShortCutX($shortCutX)
    {
        $this->shortCutX = $shortCutX;
        return $this;
    }

    /**
     * @return float
     */
    public function getShortCutX()
    {
        return $this->shortCutX;
    }

    /**
     * @param float $shortCutY
     *
     * @return $this
     */
    public function setShortCutY($shortCutY)
    {
        $this->shortCutY = $shortCutY;
        return $this;
    }

    /**
     * @return float
     */
    public function getShortCutY()
    {
        return $this->shortCutY;
    }

    /**
     * @param array $stage
     *
     * @return $this
     */
    public function setStage($stage)
    {
        $this->stage = $stage;
        return $this;
    }

    /**
     * @return array
     */
    public function getStage()
    {
        return $this->stage;
    }

    /**
     * @param \Stri\ElementBundle\Document\ElementType $type
     *
     * @return $this
     */
    public function setType($type)
    {
        $this->type = $type;
        return $this;
    }

    /**
     * @return \Stri\ElementBundle\Document\ElementType
     */
    public function getType()
    {
        return $this->type;
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

    /**
     * @param array $activePoints
     *
     * @return $this
     */
    public function setActivePoints($activePoints)
    {
        $this->activePoints = $activePoints;
        return $this;
    }

    /**
     * @return array
     */
    public function getActivePoints()
    {
        return $this->activePoints;
    }

    /**
     * @param array $ports
     *
     * @return $this
     */
    public function setPorts($ports)
    {
        $this->ports = $ports;
        return $this;
    }

    /**
     * @return array
     */
    public function getPorts()
    {
        return $this->ports;
    }

    public function jsonUnSerialize($data) {
        $this->setType($data['elementType']);
        $this->setModel((new ElementModel())->jsonUnSerialize($data['modelData']));
        if (isset($data['id']))
            $this->setId($data['id']);

        $this->setX($data['position']['x']);
        $this->setY($data['position']['y']);
        $this->setPorts($data['ports']);
        $this->setActivePoints($data['activePoints']);
        $this->setModel((new ElementModel())->jsonUnSerialize($data['modelData']));

        if (isset($data['viewData']['rotation']))
            $this->setRotation($data['viewData']['rotation']?$data['viewData']['rotation']:0);
        else
            $this->setRotation(0);

        $this->setStage($data['stage']);
        $this->setShortCut($data['viewData']['shortCut']['title']);
        $this->setShortCutX($data['viewData']['shortCut']['position']['x']);
        $this->setShortCutY($data['viewData']['shortCut']['position']['y']);

        $this->setParameters($data['parameters']);
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
            'elementType' => $this->getType(),
            'position' => array(
                'x' => $this->getX(),
                'y' => $this->getY()
            ),
            'viewData' => array(
                'rotation' => $this->getRotation(),
                'shortCut' => array(
                    'title' => $this->getShortCut(),
                    'position' => array(
                        'x' => $this->getShortCutX(),
                        'y' => $this->getShortCutY()
                    )
                )
            ),
            'ports' => $this->getPorts(),
            'activePoints' => $this->getActivePoints(),
            'parameters' => $this->getParameters(),
            'stage' => $this->getStage(),
            'modelData' => $this->getModel()->jsonSerialize()
        );
    }
}
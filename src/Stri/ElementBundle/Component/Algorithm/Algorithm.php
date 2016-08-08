<?php

namespace Stri\ElementBundle\Component\Algorithm;

class Algorithm implements \JsonSerializable {
    /** @var string */
    protected $tick = false;
    /** @var string */
    protected $start = false;
    /** @var string */
    protected $click = false;
    /** @var string */
    protected $helper = false;

    /**
     * @param $options string
     */
    public function __construct($options) {
        $parameters = json_decode($options);
        if (isset($parameters['tick'])) {
            $this->tick = $parameters['tick'];
        }
        if (isset($parameters['start'])) {
            $this->start = $parameters['start'];
        }
        if (isset($parameters['click'])) {
            $this->click = $parameters['click'];
        }

        if (isset($parameters['helper'])) {
            $this->helper = $parameters['helper'];
        }
    }

    /**
     * @param string $click
     *
     * @return $this
     */
    public function setClick($click)
    {
        $this->click = $click;
        return $this;
    }

    /**
     * @return string
     */
    public function getClick()
    {
        return $this->click;
    }

    /**
     * @param string $helper
     *
     * @return $this
     */
    public function setHelper($helper)
    {
        $this->helper = $helper;
        return $this;
    }

    /**
     * @return string
     */
    public function getHelper()
    {
        return $this->helper;
    }

    /**
     * @param string $start
     *
     * @return $this
     */
    public function setStart($start)
    {
        $this->start = $start;
        return $this;
    }

    /**
     * @return string
     */
    public function getStart()
    {
        return $this->start;
    }

    /**
     * @param string $tick
     *
     * @return $this
     */
    public function setTick($tick)
    {
        $this->tick = $tick;
        return $this;
    }

    /**
     * @return string
     */
    public function getTick()
    {
        return $this->tick;
    }

    public function toArray() {
        return array(
            'tick' => $this->getTick(),
            'start' => $this->getStart(),
            'helper' => $this->getHelper(),
            'click' => $this->getClick()
        );
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
        return json_encode($this->toArray());
    }
}
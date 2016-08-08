<?php

namespace Stri\HomeBundle\Entity\Helpers;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\UploadedFile;

trait Previewable {
    /**
     * @var string
     * @ORM\Column(name="preview", type="string", length=255, nullable=true)
     */
    protected $preview = '';

    /**
     * @var string
     * @ORM\Column(name="preview_title", type="string", nullable=true)
     */
    protected $previewTitle;

    protected $tmpImage;

    /**
     * @param string $preview
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
    public function getAbsolutePath()
    {
        return null === $this->preview ? null : $this->getUploadRootDir() . $this->getPreview();
    }

    public static function getCustomDirectory() {
        return 'default';
    }

    public static function getImageAbsolutePath($path = '') {
        $directory = __DIR__ . '/../../../../../web/uploads/' . static::getCustomDirectory();
        if (empty($path) || !is_string($path)) {
            return $directory;
        }
        return $directory . $path;
    }

    public function getPreviewImage() {
        return null === $this->preview ? null : '/uploads/' .  static::getCustomDirectory() . '/' . $this->preview;
    }

    protected function getUploadRootDir()
    {
        return static::getImageAbsolutePath();
    }

    public function upload($basepath){
        // the file property can be empty if the field is not required
        if (null === $this->preview) {
            return;
        }

        /**
         * @var $path UploadedFile
         */
        $path = $this->preview;
        if (is_object($path)) {
            $extension = pathinfo($path->getClientOriginalName(), PATHINFO_EXTENSION);
            $fileName = substr(sha1($path->getClientOriginalName()), 0, 25) . '.' . $extension;
            $path->move($this->getUploadRootDir(), $fileName);

            // set the path property to the filename where you'ved saved the file
            $this->setPreview($fileName);

            // clean up the file property as you won't need it anymore
            $this->file = null;
        }
    }

    /**
     * @param string $previewTitle
     */
    public function setPreviewTitle($previewTitle)
    {
        $this->previewTitle = $previewTitle;
        return $this;
    }

    /**
     * @return string
     */
    public function getPreviewTitle()
    {
        return $this->previewTitle;
    }

    public function getPreviewExist() {
        return file_exists($this->getImageAbsolutePath($this->getPreview()));
    }

    /**
     * @ORM\PrePersist()
     */
    public function PreviewablePrePersist() {
        $this->upload('');
    }

    /**
     * @ORM\PreUpdate()
     */
    public function PreviewableUpdate() {
        $this->upload('');
    }

    public function toArrayPreview() {
        return array(
            'previewImage' => $this->getPreviewImage(),
            'preview' => $this->getPreview(),
            'title' => $this->getPreviewTitle()
        );
    }
}
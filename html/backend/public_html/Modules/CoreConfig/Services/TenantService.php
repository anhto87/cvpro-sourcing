<?php

namespace Modules\CoreConfig\Services;

use Modules\CoreConfig\Repositories\CoreConfigRepository;
use Modules\CoreConfig\Repositories\WebsitesRepository;

class TenantService
{
    /**
     * @var CoreConfigRepository
     */
    private $coreConfigRepository;
    /**
     * @var WebsitesRepository
     */
    private $websitesRepository;

    public function __construct(
        WebsitesRepository $websitesRepository,
        CoreConfigRepository $coreConfigRepository
    )
    {
        $this->websitesRepository   = $websitesRepository;
        $this->coreConfigRepository = $coreConfigRepository;
    }

    public function getWebsiteId(): int
    {
        $currHost = request()->getHost();

        //  start query on websites table to find
        $website = $this->websitesRepository->findOneBy('domain', $currHost);

        return $website->website_id ?? false;
    }

    public function getConfig($path)
    {
        $config = $this->coreConfigRepository->findOneBy('path', $path);

        return $config->value ?? '';
    }
}

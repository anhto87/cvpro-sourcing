<?php

namespace Modules\Jobs\Http\Controllers;

use App\Services\FilterQueryBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Modules\Jobs\Repositories\JobsRepository;
use MongoDB\BSON\UTCDateTime;

class JobsController
{
    use TraitCVProTop;
    private JobsRepository $jobsRepository;
    private Request        $request;

    public function __construct(
        JobsRepository $jobsRepository,
        Request $request
    )
    {
        $this->jobsRepository = $jobsRepository;
        $this->request        = $request;
    }

    public function detail(Request $request, $job_id)
    {
        $job = $this->jobsRepository->find($job_id);

        if (empty($job->_id)) {
            return response()->json(['error' => 'NOT_FOUND'], 404);
        }

        return response()->json(['success' => 'OK', 'data' => $job->toArray()]);
    }

    public function query(FilterQueryBuilder $filters)
    {
        $data = $this->request->only(['filters', 'job_type', 'sort_by', 'x_last', 'locations']);
        $response = Http::get('https://nhanlucvietnam.net/api/cvpro/query');
        $keyword   = $data['filters'] ?? '';
        $jobType   = $data['job_type'] ?? '';
        $sortBy    = $data['sort_by'] ?? '';
        $xLast     = $data['x_last'] ?? '';
        $locations = $data['locations'] ?? '';
        $query     = $this->jobsRepository;

        if (!empty($keyword)) {
            $query = $query->whereRaw([
                '$or' => [
                    [
                        'jobTitle' => [
                            '$regex'   => '.*' . $keyword . '.*',
                            '$options' => 'i'
                        ]
                    ],
                    [
                        'company' => [
                            '$regex'   => '.*' . $keyword . '.*',
                            '$options' => 'i'
                        ]
                    ]
                ]
            ]);
        }

        if (!empty($jobType)) {
            $query = $query->whereRaw([
                'jobType' => [
                    '$not'     => ['$size' => 0],
                    '$regex'   => '.*' . $jobType . '.*',
                    '$options' => 'i'
                ]
            ]);
        }

        if (!empty($locations)) {
            $query = $query->whereRaw([
                '$or' => [
                    [
                        'jobLocations' => [
                            '$elemMatch' => [
                                '$regex'   => '.*' . $locations . '.*',
                                '$options' => 'i'
                            ]
                        ]
                    ],
                    [
                        'locations' => [
                            '$elemMatch' => [
                                '$regex'   => '.*' . $locations . '.*',
                                '$options' => 'i'
                            ]
                        ]
                    ]
                ]
            ]);
        }

        $this->appendSortBy($query, $sortBy);
        $this->appendXDay($query, $xLast);

        $limit = 10;
        $total = $query->count();
        $query = $query->paginate($limit);

        $data = $query->toArray();
        $meta = [
            'total' => $total,
            'limit' => $limit
        ];

        return response()->json(['success' => 'OK', 'data' => data_get($data, 'data'), 'meta' => $meta]);
    }

    protected function appendXDay(&$query, $xLast)
    {
        if (in_array($xLast, [-1, 1, 7, 14, 30])) {
            $timestamp = Carbon::now()->subDays($xLast);
            $query->where('publishedDate', '>', $timestamp);
        }
    }

    protected function appendSortBy(&$query, $sortBy)
    {
        if (!empty($sortBy)) {
            [$by, $sort] = explode(':', $sortBy);
            $sort  = strtolower($sort);
            $query = $query->orderBy($by, in_array($sort, ['asc', 'desc']) ? $sort : 'desc');
        } else {
            $query = $query->orderBy('publishedDate', 'desc');
        }
    }
}


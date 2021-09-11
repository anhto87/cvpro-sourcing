<?php

namespace Modules\Jobs\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

trait TraitCVProTop
{
    public function queryCVProTop(Request $request): \Illuminate\Http\JsonResponse
    {
        $response = Http::get('https://nhanlucvietnam.net/api/jobs');
        if ($response->status() === 200) {
            $body = $response->json();

            return response()->json(['jobs' => $body['data']]);
        }
    }

    public function detailCVProTop(Request $request, $job_id): \Illuminate\Http\JsonResponse
    {
        $response = Http::get('https://nhanlucvietnam.net/api/job?' . $job_id);
        if ($response->status() === 200) {
            $body = $response->json();

            return response()->json(['jobs' => $body['data']]);
        }

        return response()->json(['jobs' => []]);
    }
}

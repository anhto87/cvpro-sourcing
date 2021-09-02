<?php

namespace Modules\CoreConfig\Middleware;

use Closure;
use Illuminate\Http\Request;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            $websiteId = app()->make('tenant')->getWebsiteId();

            if (empty($websiteId)) {
                return response()->json(['status' => 'WEBSITE_UNAUTHORIZED']);
            }
        } catch (Exception $e) {
            return response()->json(['status' => 'EXCEPTION_WEBSITE_UNAUTHORIZED']);
        }

        return $next($request);
    }
}

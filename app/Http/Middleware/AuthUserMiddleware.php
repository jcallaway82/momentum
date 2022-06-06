<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class AuthUserMiddleware {
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next) {
        $userID = $request->id;

        if($userID == Auth::id() && Auth::user()->hasPermissionTo('Edit Profile')) {
            return $next($request);
        } else {
            abort('401');
        }

        /*if ($request->is('/users/'.$userID.'/profileEdit')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Profile')) {
                abort('401');
            } else {
                return $next($request);
            }
        }*/
    }
}
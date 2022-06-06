<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class ClearanceMiddleware {
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next) {
        $userID = $request->id;

        if ($request->is('updateLoan')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Pipeline')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
                //abort('401');
            } else {
                return $next($request);
            }
        }

        if ($request->is('import')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Import Encompass Pipeline')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('importPipeline')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Import Encompass Pipeline')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('importProcNeedsList')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('importUwCondList')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('updateTask')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('checkIfTaskLocked')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('lockTaskForEdit')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('lockedRecords')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Clear Record Locks')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('getBorrowers')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('addREO')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('deleteREO')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('addBorrower')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('deleteBorrower')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('addComment')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('addReply')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('deleteComment')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission for this action'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('getAlerts')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission to get alerts'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('clearAllAlerts')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission to delete alerts'
                ], 403);
            } else {
                return $next($request);
            }
        }

        if ($request->is('clearAlert')) //If user is editing a post
        {
            if (!Auth::user()->hasPermissionTo('Edit Loan Detail')) {
                return response()->json([
                    'messages' => 'You do not have permission to delete alerts'
                ], 403);
            } else {
                return $next($request);
            }
        }

        /*if ($request->isMethod('Delete')) //If user is deleting a post
        {
            if (!Auth::user()->hasPermissionTo('Delete Post')) {
                abort('401');
            }
            else
            {
                return $next($request);
            }
        }*/

        return $next($request);
    }
}
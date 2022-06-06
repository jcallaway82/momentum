<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\PipelineFilter;
use DB;


class PipelineFilterController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware(['auth', 'clearance']);
    }

    public function updateFilters(Request $request) {
        $data = $request->input('data');
        $user = Auth::user();

        DB::table('pipelineFilters')->where('user_id', '=', $user['id'])->delete();
        foreach($data as $filter) {
            if(is_array($filter)) {
                foreach($filter as $item) {
                    if($item) {
                        $addFilter = new PipelineFilter;
                        $addFilter->filter_name = $item['name'];
                        $addFilter->filter_value = $item['value'];
                        $user->pipelineFilters()->save($addFilter);
                    }
                }
            }
        }

        $filters = $user->pipelineFilters()->get();

        return response()->json([
            'messages' => 'Filters updated',
            'filters' => $filters
        ], 200);
    }

    public function clearFilters() {
        $user = Auth::user();

        DB::table('pipelineFilters')->where('user_id', '=', $user['id'])->delete();
        $filters = $user->pipelineFilters()->get();

        return response()->json([
            'messages' => 'Filters updated',
            'filters' => $filters
        ], 200);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Auth;
use DB;
use App\Alert;

class AlertsController extends Controller {

    public function __construct() {
        $this->middleware(['auth', 'clearance']); //isAdmin middleware lets only users with a //specific permission permission to access these resources
    }

    /**
     * Display a listing of the resource.
     *
     */
    public function getAlerts() {
        $user = Auth::user();
        $alerts = $user->alerts()->get();
        $comments = array();

        foreach($alerts as $a) {
            if($a['table_name'] === 'comments') {
                $comments[] = DB::table('comments')
                    ->join('loans', 'comments.loan_id', '=', 'loans.id')
                    ->select(
                        'comments.tabKey',
                        'comments.id as comment_id',
                        'comments.field_name',
                        'comments.user',
                        'comments.text',
                        'loans.id',
                        'loans.borrower_name')
                    ->where('comments.id', '=', $a['comment_id'])
                    ->first();
            } else {
                $comments[] = DB::table('replies')
                    ->join('comments', 'replies.comment_id', '=', 'comments.id')
                    ->join('loans', 'comments.loan_id', '=', 'loans.id')
                    ->select(
                        'comments.tabKey',
                        'replies.id as comment_id',
                        'comments.field_name',
                        'comments.user',
                        'replies.text',
                        'loans.id',
                        'loans.borrower_name')
                    ->where('replies.id', '=', $a['comment_id'])
                    ->first();
            }
        }

        $collection = collect($comments);
        $grouped = [
            'borrowers' => $collection->groupBy('borrower_name')->transform(function($entry, $key) {
                return [
                    'title' => $key,
                    'entries' => $entry->transform(function($item) {
                        return [
                            'tabKey' => $item->tabKey,
                            'comment_id' => $item->comment_id,
                            'field_name' => $item->field_name,
                            'user' => $item->user,
                            'text' => $item->text,
                            'loan_id' => $item->id,
                            'borrower_name' => $item->borrower_name
                        ];
                    })->toArray()
                ];
            })->toArray()
        ];
        $numComments = count($comments);
        $data = [];
        $data = array_add($data,'numComments', $numComments);
        $data = array_add($data, 'groupedBy', $grouped);

        return $data;
        //return $comments;

        /*ini_set("xdebug.var_display_max_depth", 50);
        $user = Auth::user();
        $alerts = $user->alerts()->get();
        $comments = array();
        //var_dump($alerts);
        foreach($alerts as $a) {
            $comments[] = Comment::where('id', '=', $a['comment_id'])->firstOrFail();
            //var_dump($comments);
        }
        var_dump($comments);
        die();*/

        /*return response()->json([

        ]);*/
    }

    public function clearAllAlerts() {
        $user = Auth::user();
        $alerts = $user->alerts()->get();

        foreach($alerts as $alert) {
            Alert::destroy($alert['id']);
        }

        return $this->getAlerts();
    }

    public function clearAlert(Request $request) {
        $data = $request->input('data');
        $user = Auth::user();

        $alert = Alert::where([
            ['comment_id', '=', $data['comment_id']],
            ['user_id', '=', $user['id']]
        ])->firstOrFail();

        if($alert['user_id'] === $user['id']) {
            $alert->delete();
        } else {
            return response()->json([
                'messages' => 'You are not authorized to delete this alert.'
            ], 403);
        }

        return $this->getAlerts();
    }

}
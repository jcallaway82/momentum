<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Loan;
use App\Comment;
use App\Reply;
use App\Alert;
use App\User;
use Auth;
use DB;

class CommentController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware(['auth', 'clearance']);
    }

    public function addComment(Request $request) {
        $data = $request->input('data');

        $loan = Loan::find($data['loan']);
        $user = Auth::user();

        $comment = new Comment;
        $loan->comment()->save($comment);

        $comment->field_name = $data['newComment']['field_name'];
        $comment->text = $data['newComment']['text'];
        $comment->tagged_user = $data['newComment']['tagged_user'];
        $comment->user = $user['name'];
        $comment->tabKey = $data['newComment']['tabKey'];
        $comment->procNeedList_id = $data['newComment']['procNeedList_id'];
        $comment->uwCondition_id = $data['newComment']['uwCondition_id'];
        $comment->save();

        if($comment->tagged_user) {
            $tagged_user = User::where('name', '=', $comment->tagged_user)->firstOrFail();
            $alert = new Alert;
            $tagged_user->alerts()->save($alert);
            $alert->comment_id = $comment->id;
            $alert->table_name = 'comments';
            $alert->save();
        } else {
            $users = User::where('name', '=', $loan['tm_loan_officer'])
                ->orWhere('name', '=', $loan['tm_lo_assistant'])
                ->orWhere('name', '=', $loan['tm_setup'])
                ->orWhere('name', '=', $loan['tm_loan_processor'])
                ->orWhere('name', '=', $loan['tm_underwriter'])
                ->orWhere('name', '=', $loan['tm_closer'])
                ->orWhere('name', '=', $loan['tm_funder'])
                ->get();
            foreach($users as $userAlert) {
                if($userAlert['name'] !== $user['name']) {
                    $alert = new Alert;
                    $userAlert->alerts()->save($alert);
                    $alert->comment_id = $comment->id;
                    $alert->table_name = 'comments';
                    $alert->save();
                }
            }
        }

        return Comment::with(['reply'])->where('loan_id', '=', $data['loan'])->get();
    }

    public function deleteComment(Request $request) {
        $data = $request->input('data');

        $user = Auth::user();
        $comment = Comment::where('id','=', $data['comment_id'])->firstOrFail();
        $replies = $comment->reply()->get();

        if($data['user'] === $user['name']) {
            $comment->delete();
            foreach($replies as $reply) {
                $reply->delete();
                Alert::where('comment_id', '=', $reply['id'])->delete();
            }
            Alert::where('comment_id', '=', $data['comment_id'])->delete();
        } else {
            return response()->json([
                'messages' => 'You cannot delete this comment.'
            ], 403);
        }

        return Comment::with(['reply'])->where('loan_id', '=', $data['loan_id'])->get();
    }
}

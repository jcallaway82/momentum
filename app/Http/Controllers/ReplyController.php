<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Comment;
use App\Reply;
use App\User;
use App\Loan;
use App\Alert;
use Illuminate\Support\Facades\Auth;

class ReplyController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware(['auth', 'clearance']);
    }

    public function addReply(Request $request) {
        $data = $request->input('data');

        $comment = Comment::find($data['comment_id']);
        $loan = Loan::find($comment->loan_id);
        $user = Auth::user();

        $reply = new Reply;
        $comment->reply()->save($reply);

        $reply->text = $data['text'];
        $reply->tagged_user = $data['tagged_user'];
        $reply->user = $user['name'];
        $reply->save();

        if($reply->tagged_user) {
            $tagged_user = User::where('name', '=', $reply->tagged_user)->firstOrFail();
            $alert = new Alert;
            $tagged_user->alerts()->save($alert);
            $alert->comment_id = $reply->id;
            $alert->table_name = 'replies';
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
                    $alert->comment_id = $reply->id;
                    $alert->table_name = 'replies';
                    $alert->save();
                }
            }
        }

        return Comment::with(['reply'])->where('loan_id', '=', $comment['loan_id'])->get();
    }

    public function deleteReply(Request $request) {
        $data = $request->input('data');

        $user = Auth::user();

        if($data['user'] === $user['name']) {
            Reply::destroy($data['reply_id']);
            Alert::where('comment_id', '=', $data['reply_id'])->delete();
        } else {
            return response()->json([
                'messages' => 'You cannot delete this comment.'
            ], 403);
        }

        return Comment::with(['reply'])->where('loan_id', '=', $data['loan_id'])->get();
    }
}

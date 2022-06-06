<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Loan;
use App\ProcNeedList;
use App\Comment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ProcNeedListController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware(['auth', 'clearance']);
    }

    public function getNeedsList(Request $request) {
        $loan = Loan::find($request->input('loan_id'));
        $needsList = $loan->procNeedList()->where('new_import', '=', 'Y')->get();

        return $needsList;
    }

    public function updateProcNeeds(Request $request) {
        $data = $request->input('data');

        try {
            $needItem = ProcNeedList::findOrFail($data['item_id']);
            $needItem->update([$data['column'] => $data['value']]);
            $needItem->save();

            $loan = Loan::find($data['loan_id']);
            $needsList = $loan->procNeedList()->where('new_import', '=', 'Y')->get();

            return response()->json([
                'messages' => 'Need list item successfully updated',
                'needsList' => $needsList,
            ], 200);
        } catch (ModelNotFoundException $ex) {
            return response()->json([
                'messages' => $ex->getMessage()
            ], 403);
        }
    }
}

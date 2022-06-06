<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Loan;
use App\UWCondition;

class UWConditionController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware(['auth', 'clearance']);
    }

    public function getCondList(Request $request) {
        $loan = Loan::find($request->input('loan_id'));
        $condList = $loan->uwCondition()->where('new_import', '=', 'Y')->get();

        return $condList;
    }

    public function updateCondList(Request $request) {
        $data = $request->input('data');

        try {
            $condItem = UWCondition::findOrFail($data['item_id']);
            $condItem->update([$data['column'] => $data['value']]);
            $condItem->save();

            $loan = Loan::find($data['loan_id']);
            $condList = $loan->uwCondition()->where('new_import', '=', 'Y')->get();

            return response()->json([
                'messages' => 'Need list item successfully updated',
                'condList' => $condList,
            ], 200);
        } catch (ModelNotFoundException $ex) {
            return response()->json([
                'messages' => $ex->getMessage()
            ], 403);
        }
    }
}

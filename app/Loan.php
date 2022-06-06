<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Illuminate\Support\Facades\Auth;
use DB;

class Loan extends Model implements AuditableContract
{
    use Auditable;

    protected $table = 'loans';

    public function users() {
        return $this->belongsToMany('App\User');
    }

    public function processorWorksheet() {
        return $this->hasOne('App\ProcessorWorksheet');
    }

    public function officerWorksheet() {
        return $this->hasOne('App\OfficerWorksheet');
    }

    public function borrower() {
        return $this->hasMany('App\Borrower');
    }

    public function reo() {
        return $this->hasMany('App\Reo');
    }

    public function comment() {
        return $this->hasMany('App\Comment');
    }

    public function procNeedList() {
        return $this->hasMany('App\ProcNeedList');
    }

    public function uwCondition() {
        return $this->hasMany('App\UWCondition');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'loan_id',
        'borrower_name',
        'loan_type',
        'loan_term',
        'note_rate',
        'loan_purpose',
        'milestone',
        'tm_loan_officer',
        'tm_lo_assistant',
        'tm_setup',
        'tm_loan_processor',
        'tm_underwriter',
        'tm_closer',
        'tm_funder',
        'lock_status',
        'cd_sent_date',
        'cd_received_date',
        'application_date',
        'qualification_date',
        'setup_date',
        'processing_date',
        'initial_uw_date',
        'le_locked_resub_date',
        'cd_closing_date',
        'docs_out_date',
        'actual_closing_date',
        'scheduled_closing_date',
        'subject_property_address',
        'subject_property_city',
        'subject_property_state',
        'subject_property_zip',
        'subject_property_county',
        'subject_property_purchase_price',
        'loan_amount',
        'borr_first_name',
        'borr_last_name',
        'borr_email',
        'borr_home_phone',
        'borr_cell',
        'coBorr_first_name',
        'coBorr_last_name',
        'coBorr_email',
        'coBorr_home_phone',
        'coBorr_cell',
        'buyers_agent_name',
        'buyers_agent_contact_name',
        'buyers_agent_email',
        'buyers_agent_phone',
        'sellers_agent_name',
        'sellers_agent_contact_name',
        'sellers_agent_email',
        'sellers_agent_phone',
        'title_co_name',
        'title_co_contact',
        'title_co_phone',
        'new_import',
        'review_status'
    ];

    public static function getLoans() {
        $user = Auth::user();
        $filters = $user->pipelineFilters()->get();
        $procWorksheets = [];
        $loanOfficers = [];
        $loanProcessors = [];
        $reviewStatusFilter = [];
        $loanPurposeFilter = [];
        $milestoneFilter = [];
        $loanOfficerFilter = [];
        $loanProcessorFilter = [];

        if($filters) {
            foreach($filters as $filter) {
                if($filter['filter_name'] === 'review_status') {
                    array_push($reviewStatusFilter, $filter['filter_value']);
                } else if($filter['filter_name'] === 'loan_purpose') {
                    array_push($loanPurposeFilter, $filter['filter_value']);
                } else if($filter['filter_name'] === 'milestone') {
                    array_push($milestoneFilter, $filter['filter_value']);
                } else if($filter['filter_name'] === 'tm_loan_officer') {
                    array_push($loanOfficerFilter, $filter['filter_value']);
                } else if($filter['filter_name'] === 'tm_loan_processor') {
                    array_push($loanProcessorFilter, $filter['filter_value']);
                }
            }

            $loans = $user->loans()->newQuery();

            if (count($reviewStatusFilter) !== 0) {
                $loans->whereIn('review_status', $reviewStatusFilter);
            }

            if (count($loanPurposeFilter) !== 0) {
                $loans->whereIn('loan_purpose', $loanPurposeFilter);
            }

            if (count($milestoneFilter) !== 0) {
                $loans->whereIn('milestone', $milestoneFilter);
            }

            if (count($loanOfficerFilter) !== 0) {
                $loans->whereIn('tm_loan_officer', $loanOfficerFilter);
            }

            if (count($loanProcessorFilter) !== 0) {
                $loans->whereIn('tm_loan_processor', $loanProcessorFilter);
            }

            $loans = $loans->get();
        } else {
            $loans = $user->loans()->get();
        }

        foreach($loans as $loan) {
            $procWorksheets[] = $loan->processorWorksheet()->get();
        }

        $allLoans = $user->loans()->get();
        foreach ($allLoans as $loan) {
            $loanOfficers[$loan['tm_loan_officer']] = $loan['tm_loan_officer'];
            if($loan['tm_loan_processor'] == null) {
                $loanProcessors['null'] = 'Not Assigned';
            } else {
                $loanProcessors[$loan['tm_loan_processor']] = $loan['tm_loan_processor'];
            }
        }

        $loanOfficers = array_unique($loanOfficers);
        $formattedLoanOfficers = [];
        foreach($loanOfficers as $officer) {
            array_push($formattedLoanOfficers, array('title' => $officer, 'key' => $officer));
        }

        $loanProcessors = array_unique($loanProcessors);
        $formattedLoanProcessors = [];
        foreach($loanProcessors as $processor) {
            array_push($formattedLoanProcessors, array('title' => $processor, 'key' => $processor));
        }

        $returnLoans = [];
        $returnLoans = array_add($returnLoans, 'loans', $loans);
        $returnLoans = array_add($returnLoans, 'procWorksheets', $procWorksheets);
        $returnLoans = array_add($returnLoans, 'loanOfficers', $formattedLoanOfficers);
        $returnLoans = array_add($returnLoans, 'loanProcessors', $formattedLoanProcessors);
        $returnLoans = array_add($returnLoans, 'filters', $filters);

        return $returnLoans;
    }
}

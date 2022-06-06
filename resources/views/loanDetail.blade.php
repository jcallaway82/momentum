@extends('layouts.app')

@section('pageTitle')
    {{ $item->borrower_name }}
@endsection

@section('content')
    <div class="container" style="width:1400px">
        <div class="panel panel-default">
            <div class="panel-heading">
                <div class="row">
                    <div class="col-md-3">
                        <strong><p style="font-size:18px">{{ $item->borrower_name }}</p></strong>
                    </div>
                    <div class="col-md-2">
                        <strong><p style="font-size:18px">{{ $item->loan_id }}</p></strong>
                    </div>
                    <div class="col-md-5">
                        <strong>{{ $item->subject_property_address }}, {{ $item->subject_property_city }}, {{ $item->subject_property_state }}, {{ $item->subject_property_zip }}, {{ $item->subject_property_county }} County</strong>
                    </div>
                    <div class="col-md-2">
                        <strong>Closing Date: </strong>{{ Carbon\Carbon::parse($item->actual_closing_date)->format('m-d-Y') }}
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <strong>{{ $item->loan_type }} / {{ $item->loan_purpose }}</strong>
                    </div>
                    <div class="col-md-2">
                        <strong>Purchase Price: </strong>${{ $item->subject_property_purchase_price }}
                        <p></p>
                    </div>
                    <div class="col-md-3">
                        <strong>Total Loan Amount: </strong>${{ $item->loan_amount }}
                    </div>
                    <div class="col-md-3">
                        <strong>Loan Term: </strong>{{ $item->loan_term }} months
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <strong>Current Milestone: </strong>{{ $item->milestone }}
                    </div>
                    <div class="col-md-2">
                        <strong>Lock Status: </strong>{{ $item->lock_status }}
                    </div>
                    <div class="col-md-2">
                        <strong>Note Rate: </strong>{{ $item->note_rate }} %
                    </div>
                    <div class="col-md-3">
                        <strong>CD Sent: </strong>{{ $item->cd_sent_date }}
                    </div>
                    <div class="col-md-2">
                        <strong>CD Received: </strong>{{ $item->cd_received_date }}
                    </div>
                </div>
            </div>
            <div class="panel-body" style="float:left; width: 180px" id="teamMembers"></div>
            <div class="panel-body" id="loanDetail"></div>
        </div>
    </div>
    <script type="text/javascript">
        window.data= {!! json_encode($data) !!};
        window.teamMembers= {!! json_encode($allTeamMembers) !!};
    </script>
@endsection
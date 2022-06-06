<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('pageTitle') {{ config('app.name', 'Momentum') }}</title>

    <!-- Styles -->
    <link href="{{ mix('css/app.css') }}" rel="stylesheet">

    <link href="{{ asset('css/styles.css') }}" rel="stylesheet">

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">

    <link href="{{ asset('css/semanticUI.css') }}" rel="stylesheet">

    <link href="{{ asset('css/antd.css') }}" rel="stylesheet">

    <!-- Scripts -->
    <script>
        window.Laravel = {!! json_encode([
            'csrfToken' => csrf_token(),
        ]) !!};
    </script>
    <script src="https://use.fontawesome.com/9712be8772.js"></script>

    <!-- polyfills for IE -->
    <script src="https://cdn.polyfill.io/v2/polyfill.js?features=es6,Object.entries"></script>

    <!-- Styles -->
    <style>
        .title-bar {
            /*background: url("/images/1860.jpg");
            background-repeat: no-repeat;
            background-size: 100% 100%;*/
            background-color: #143154;
        }

        .font-color {
            color: white !important;
        }

        .navbar-default .navbar-nav > li > a {
            color: white !important;
        }
    </style>
</head>
<body>
    <div id="app">
        <nav class="navbar navbar-default navbar-static-top title-bar">
            <div class="container">
                <div class="navbar-header">

                    <!-- Collapsed Hamburger -->
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#app-navbar-collapse">
                        <span class="sr-only">Toggle Navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>

                    <!-- Branding Image -->
                    <a class="navbar-brand  font-color">
                        {{ config('app.name', 'Momentum') }}
                    </a>
                </div>

                <div class="collapse navbar-collapse" id="app-navbar-collapse">
                    <!-- Left Side Of Navbar -->
                    @if (!Auth::guest())
                        <ul class="nav navbar-nav" style="color:white">
                            <li><a href="{{ route('home') }}">Home</a></li>
                        </ul>

                        <ul class="nav navbar-nav">
                            <li><a><div id="newAlerts"></div></a></li>
                        </ul>
                    @endif

                    <!-- Right Side Of Navbar -->
                    <ul class="nav navbar-nav navbar-right">
                        <!-- Authentication Links -->
                        @if (Auth::guest())
                            <li><a href="{{ route('login') }}">Login</a></li>
                        @else
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
                                    {{ Auth::user()->name }} <span class="caret"></span>
                                </a>

                                <ul class="dropdown-menu" role="menu">
                                    <li>
                                        @role('Admin') {{-- Laravel-permission blade helper --}}
                                        <a href="{{ route('users.index') }}"><i class="fa fa-btn fa-unlock"></i>Admin</a>
                                        <a href="{{ route('import') }}">Import File</a>
                                        <a href="{{ route('lockedRecords') }}">Unlock Records</a>
                                        @endrole
                                        @role('Superuser')
                                        <a href="{{ route('import') }}">Import File</a>
                                        <a href="{{ route('lockedRecords') }}">Unlock Records</a>
                                        @endrole
                                        <a href="{{ route('profileEdit', Auth::user()->id) }}">Edit Profile</a>
                                        <a href="{{ route('logout') }}" onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                                            Logout
                                        </a>

                                        <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                                            {{ csrf_field() }}
                                        </form>
                                    </li>
                                </ul>
                            </li>
                        @endif
                    </ul>
                </div>
            </div>
        </nav>

        @if(Session::has('flash_message'))
            <div class="container">
                <div class="alert alert-success"><em> {!! session('flash_message') !!}</em>
                </div>
            </div>
        @endif

        <div class="row" style="margin-right: auto !important; margin-left: auto !important">
            <div class="col-md-8 col-md-offset-2">
                @include ('errors.list') {{-- Including error file --}}
            </div>
        </div>

        @yield('content')

    </div>

    <!-- Scripts -->
    <script src="{{ mix('js/app.js') }}"></script>
</body>
</html>

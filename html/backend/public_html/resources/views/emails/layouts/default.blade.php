<!DOCTYPE html>
<html>
    @include('emails.layouts.head')
    <body class="">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
            <tr>
                <td>

                </td>
                <td class="container">
                    <div><img style="height: 25px" src="{{app('tenant')->getConfig('logo')}}" alt=""></div>
                    <div class="content">
                        <!-- START CENTERED WHITE CONTAINER -->
                        <table role="presentation" class="main">
                            <!-- START MAIN CONTENT AREA -->
                            <tr>
                                <td class="wrapper">
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td>
                                                @yield('content')
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <!-- END MAIN CONTENT AREA -->
                        </table>
                        <!-- END CENTERED WHITE CONTAINER -->
                        @include('emails.layouts.footer')
                    </div>
                </td>
            </tr>
        </table>
    </body>
</html>

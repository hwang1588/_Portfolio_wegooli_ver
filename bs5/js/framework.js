//비밀번호 on/off 관련:S//

$(".toggle-password-1").click(function () {
    //".toggle-password"를 클릭하면
    $(this).toggleClass("bi-eye bi-eye-slash");
    //"bi-eye=눈을 뜨는 아이콘" "bi-eye-slash=눈을 감는 아이콘
    var input = $($(this).attr("toggle"));
    //토글을 통해서 제어
    if (input.attr("type") == "password") {
        input.attr("type", "text");
        //각 type에 대한 정의(핸들링x)
    } else {
        input.attr("type", "password");
    }
    //각 type에 대한 정의(핸들링x)

});

//비밀번호 on/off 관련:E//

//비밀번호 확인 on/off 관련:S//

$(".toggle-password-2").click(function () {
    //".toggle-password"를 클릭하면
    $(this).toggleClass("bi-eye bi-eye-slash");
    //"bi-eye=눈을 뜨는 아이콘" "bi-eye-slash=눈을 감는 아이콘
    var input = $($(this).attr("toggle"));
    //토글을 통해서 제어
    if (input.attr("type") == "password") {
        input.attr("type", "text");
        //각 type에 대한 정의(핸들링x)
    } else {
        input.attr("type", "password");
    }
    //각 type에 대한 정의(핸들링x)

});

//비밀번호 확인 on/off 관련:E//

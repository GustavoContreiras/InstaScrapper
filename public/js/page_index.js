(function ($) {
    "use strict"; // Start of use strict

    // Smooth scrolling using jQuery easing
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: (target.offset().top - 54)
                }, 1000, "easeInOutExpo");
                return false;
            }
        }
    });

    // Closes responsive menu when a scroll trigger link is clicked
    $('.js-scroll-trigger').click(function () {
        $('.navbar-collapse').collapse('hide');
    });

    // Activate scrollspy to add active class to navbar items on scroll
    $('body').scrollspy({
        target: '#mainNav',
        offset: 56
    });

    // Collapse Navbar
    var navbarCollapse = function () {
        if ($("#mainNav").offset().top > 100) {
            $("#mainNav").addClass("navbar-shrink");
        } else {
            $("#mainNav").removeClass("navbar-shrink");
        }
    };

    // Collapse now if page is not at top
    navbarCollapse();

    // Collapse the navbar when page is scrolled
    $(window).scroll(navbarCollapse);

    $('#tableUsers').toggleClass('d-none');

    $('#searchInput').on('keyup', (event) => {
        console.log(event);
        if (event.key === 'Enter') {
            fetchUser();
        }
    });

    window.profilesLoaded = [];

})(jQuery); // End of use strict

function saveUser() {

    const tableRows = $('#tableData tr');

    const fullname = $($(tableRows[0]).children()[1]).text().trim();
    const username = $($(tableRows[1]).children()[1]).text().trim();
    const followersCount = $($(tableRows[2]).children()[1]).text().trim();
    const followsCount = $($(tableRows[3]).children()[1]).text().trim();
    const mutualFollowsCount = $($(tableRows[4]).children()[1]).text().trim();
    const savedMediasCount = $($(tableRows[5]).children()[1]).text().trim();
    const highlightReelCount = $($(tableRows[5]).children()[1]).text().trim();
    const igTvVideosCount = $($(tableRows[5]).children()[1]).text().trim();
    const postsCount = $($(tableRows[6]).children()[1]).text().trim();
    const last12PostsLikeRate = $($(tableRows[6]).children()[1]).text().trim();
    const last12PostsVideosCount = $($(tableRows[6]).children()[1]).text().trim();
    const last12IgTvVideosLikeRate = $($(tableRows[7]).children()[1]).text().trim();
    const last12IgTvVideosTotalDuration = $($(tableRows[7]).children()[1]).text().trim().replace('s', '');
    const last12IgTvVideosDurationRate = $($(tableRows[7]).children()[1]).text().trim().replace('s', '');

    const userData = {
        fullname: fullname,
        username: username,
        followersCount: parseInt(followersCount),
        followsCount: parseInt(followsCount),
        mutualFollowsCount: parseInt(mutualFollowsCount),
        savedMediasCount: parseInt(savedMediasCount),
        highlightReelCount: parseInt(highlightReelCount),
        igTvVideosCount: parseInt(igTvVideosCount),
        postsCount: parseInt(postsCount),
        last12PostsLikeRate: parseFloat(last12PostsLikeRate),
        last12PostsVideosCount: parseInt(last12PostsVideosCount),
        last12IgTvVideosLikeRate: parseFloat(last12IgTvVideosLikeRate),
        last12IgTvVideosTotalDuration: parseInt(last12IgTvVideosTotalDuration),
        last12IgTvVideosDurationRate: parseFloat(last12IgTvVideosDurationRate),
    }

    fetch("https://protected-badlands-29733.herokuapp.com/save", {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify(userData)
    })
        .then(response => {
            if (response.status !== 200) {
                alert('Algo deu errado ao salvar o perfil');
            } else {
                alert('Usuário salvo!')
            }
        })
        .catch(err => {
            alert(err.message)
            console.error(err);
        });
}

function toggleProfiles() {

    if ($('#tableUsers').attr('class').includes('d-none')) {

        fetch("https://protected-badlands-29733.herokuapp.com/list", {
            "method": "GET",
            "headers": {
                "Content-Type": "application/json"
            },
        })
        .then(response => {
            if (response.status !== 200) {
                alert('Algo deu errado ao obters os perfis salvos');
            } else {
                return response.json();
            }
        })
        .then(json => {
            $('#tableData').addClass('d-none'); 
            $('#tableUsers').removeClass('d-none');
            $('#tableUsers tbody').empty();
            json.forEach(profile => {
                if (window.profilesLoaded.findIndex((element, index, array) => profile.username == element.username) === -1) {
                    window.profilesLoaded.push(profile);
                    $('#tableUsers tr:last').after(`<tr>
                        <td style="width: 50%;" name="name">
                            <span class="mr-2">${profile.fullname}:</span>
                            <a href="/?profile=${profile.username}">${profile.username}</a>
                        </td>
                    </tr>`);
                }
            });
        })
        .catch(err => {
            alert(err.message)
            console.error(err);
        });
    } else {
        $('#tableData').removeClass('d-none'); 
        $('#tableUsers').addClass('d-none');
    }

    return;    
}
function fetchUser() {

    const user = $('#searchInput').val();
    const tableRows = $('#tableData tr');

    for (let row of tableRows) {
        $($(row).children()[1]).text('');
    }

    window.location = `/?profile=${user}`;
}
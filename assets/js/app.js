/* eslint-disable */

$(function() {
  $('.collapsable li div').hide();

  $('.collapsable .toggle').click(function(e) {
    e.preventDefault();
    $(this).parent().find('div').toggle();
    $(this).parent().toggleClass('active');
  });

  $('.mobile-search').click(function(e) {
    e.preventDefault();

    $('.small-search').fadeIn(250);
  });

  // SHORTCUTS MENU
  $('.shortcuts ul').hide();

  $('.button-shortcut').click(function(e) {
    e.preventDefault();

    $('.shortcuts ul').toggle();

    $(this).toggleClass('active');

    if ($('.button-shortcut img').attr('src') === '/public/images/chevron.svg') {
      $('.button-shortcut img').attr('src', '/public/images/chevron-active.svg');
    } else {
      $('.button-shortcut img').attr('src', '/public/images/chevron.svg');
    }
  });

  $('.shortcuts ul li a').click(function(e) {
    e.preventDefault();

    var right = $(this).attr('data-right');

    $('.shortcuts ul').hide();
    $('.button-shortcut').removeClass('active');
    $('.button-shortcut img').attr('src', '/public/images/chevron.svg');

    $('.shortcut-info').hide();
    $('#shortcut-' + right).fadeIn(250);
  });

  // $(window).on('resize', function() {
  //   $('.')
  // });
});

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
  });

  $('.shortcuts ul li a').click(function(e) {
    e.preventDefault();

    var right = $(this).attr('data-right');

    $('.shortcuts ul').hide();
    $('.button-shortcut').removeClass('active');

    $('.shortcut-info').hide();
    $('#shortcut-' + right).fadeIn(250);
  });

  // $(window).on('resize', function() {
  //   $('.')
  // });
});

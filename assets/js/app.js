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

  // SHORTCUTS
  $('.shortcuts ul li div').hide();

  $('.shortcuts ul li a.toggle').click(function(e) {
    e.preventDefault();

    $('.shortcuts ul li div').hide();
    $(this).parent().find('div').show();
    $('.shortcuts ul li a').removeClass('bold');
    $(this).addClass('bold');
  });

  $('.copy-to-clipboard').click(function(e) {
    e.preventDefault();

    $(this).parent().parent().find('textarea').select();
    document.execCommand('copy');
    $(this).parent().parent().find('textarea').blur();

    $(this).parent().text('Copied');
    $(this).remove();
  });
});

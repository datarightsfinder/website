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
  $('.shortcuts li .shortcut-info').hide();

  $('.shortcuts li a.toggle').click(function(e) {
    e.preventDefault();

    $(this).parent().find('.shortcut-info').toggle();

    if ($(this).parent().find('.shortcut-info').is(':visible')) {
      $(this).addClass('bold');
    } else {
      $(this).removeClass('bold');
    }
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

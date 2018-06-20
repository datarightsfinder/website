$(function() {
  // MOBILE SEARCH
  $('.mobile-search').click(function(e) {
    e.preventDefault();

    $('.small-search').fadeIn(250);
  });

  // COLLAPSABLES
  $('.collapsable-content').hide();

  $('.collapsable li a.toggle').click(function(e) {
    e.preventDefault();

    $(this).parent().find('.collapsable-content').toggle();

    if ($(this).parent().find('.collapsable-content').is(':visible')) {
      $(this).addClass('bold');
    } else {
      $(this).removeClass('bold');
    }
  });

  // COPY TO CLIPBOARD
  $('.copy-to-clipboard').click(function(e) {
    e.preventDefault();

    $(this).parent().parent().find('textarea').select();
    document.execCommand('copy');
    $(this).parent().parent().find('textarea').blur();

    $(this).text('Copied');
  });
});

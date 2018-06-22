$(function() {
  // MOBILE MENU
  $('.mobile-menu').click(function(e) {
    e.preventDefault();

    $('.nav').toggleClass('active');
    $(this).toggleClass('active');

    if ($('.nav').is(':visible')) {
      $(this).text('Close');
    } else {
      $(this).text('Menu');
    }
  });

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

  // MESSAGE TEMPLATES
  $('textarea').each(function(i, e) {
    $(e).text($(e).text().replace('{{name}}', orgName));
  });
});

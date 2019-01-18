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

  $('.toggle-collapsable-content .toggle').click(function(e) {
    e.preventDefault();

    $('.collapsable-content').toggle();

    $('.toggle-collapsable-content').toggleClass('active');
  });

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

    var text = $(this).parent().parent().find('textarea').text();
    clipboard.writeText(text);

    $(this).text('Copied');
  });

  // MESSAGE TEMPLATES
  $('textarea').each(function(i, e) {
    $(e).text($(e).text().replace('{{name}}', orgName));
  });

  // BACK TO TOP
  if ($('.allOrgs').length || $('.organisation').length) {
    $(window).scroll(function(e) {
      var viewportHeight = $(window).height();
      var scrollY = e.pageY;

      if (scrollY > viewportHeight) {
        $('.back-to-top').addClass('active');
      } else {
        $('.back-to-top').removeClass('active');
      }
    })
  }

  // STICKY CONTENTS MENU

  if ($('.contents').length) {
    var contentsTop = $('.contents').offset().top;
    $(window).scroll(function(e) {
      if (e.pageY > contentsTop) {
        $('.contents').css('position', 'fixed');
        $('.contents').css('top', '0px');
      } else {
        $('.contents').css('position', 'static');
      }
    })
  }
});

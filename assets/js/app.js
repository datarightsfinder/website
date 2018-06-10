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
});

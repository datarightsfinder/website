/* eslint-disable */

$(function() {
  // ORGANISATION PAGE
  $('.rights-selector').click(function(e) {
    e.preventDefault();

    $('.rights-selector').removeClass('active');
    $(this).addClass('active');

    var target = $(this).text().replace(/ /g, '-').toLowerCase();
    $('.single-right').hide();
    $('#single-right-' + target).show();
  });
});

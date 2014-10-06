//helpers methods to disable, enable, and uncheck radio buttons and checkboxes
(function( $ ){
    //disable an element
    $.fn.disable = function() {
        return this.attr('disabled', 'disabled');
    };
})( jQuery );

(function( $ ){
    //enable an element
    $.fn.enable = function() {
        return this.removeAttr('disabled');
    };
})( jQuery );

(function( $ ){
    //uncheck an element
    $.fn.uncheck = function() {
        return this.removeAttr('checked');
    };
})( jQuery );

(function( $ ){
    //check an element
    $.fn.check = function() {
        return this.attr('checked', 'checked');
    };
})( jQuery );

(function( $ ){
    //(pre-)check the only active database checkbox
    $.onedb = function(selector) {
        active_dbs = $(".databases input[type=checkbox]").not(":disabled")
        if (active_dbs.length == 1){
            active_dbs.check()
        }
        return active_dbs;
    };
})( jQuery );

(function( $ ){
    //highlight an element
    $.fn.highlight = function() {
        return this.addClass('focussed');
    };
})( jQuery );

(function( $ ){
    //unhighlight an element
    $.fn.unhighlight = function() {
        return this.removeClass('focussed');
    };
})( jQuery );

(function ($) {
    $.fn.poll = function () {
        var that, val, tmp;

        that = this;
        val  = that.val();

        (function ping () {
            tmp = that.val();

            if (tmp != val){
                val = tmp;
                that.change();
            }

            setTimeout(ping, 100);
        }());

        return this;
    };
}(jQuery));

/*
    SS - SequenceServer's JavaScript module

    Define a global SS (acronym for SequenceServer) object containing the
    following methods:

        main():
            Initializes SequenceServer's various modules.
*/

//define global SS object
var SS;
if (!SS) {
    SS = {};
}

//SS module
(function () {

    SS.decorate = function (name) {
      return name.match(/(.?)(blast)(.?)/).slice(1).map(function (token, _) {
        if (token) {
            if (token !== 'blast'){
                return '<strong>' + token + '</strong>';
            }
            else {
              return token;
            }
        }
      }).join('');
    };

    SS.generateGraphicalOverview = function () {
        var setupTooltip = function () {
            $('[data-toggle="tooltip"]').tooltip({
                'placement': 'top',
                'container': 'body',
                'html': 'true',
                'white-space': 'nowrap'
            });
        }

        var initButtons = function (pId, howMany) {
            var lessButton = $('.less', pId),
                moreButton = $('.more', pId),
                totalHits = $(pId).data().hitCount,
                shownHits = $(pId).find('.ghit > g').length;

            if (shownHits < 20) {
                lessButton.attr('disabled', 'disabled');
                moreButton.attr('disabled', 'disabled');
            }
            else if (shownHits === totalHits) {
                moreButton.attr('disabled', 'disabled');
                lessButton.removeAttr('disabled');
            }
            else if (shownHits === 20) {
                lessButton.attr('disabled', 'disabled');
                moreButton.removeAttr('disabled');
            }
            else {
                lessButton.removeAttr('disabled');
                moreButton.removeAttr('disabled');
            }
        }

        $("[data-graphit='overview']").each(function () {
            $.graphIt(this, 0, 20);
            initButtons(this, 0);
        });

        setupTooltip();

        $('.more').on('click', function (e) {
            var howMany = 20;
            var pId = '#'+$(this).data().parentQuery;
            var shownHits = $(pId).find('.ghit > g').length;
            $.graphIt(pId, shownHits, howMany);
            initButtons(pId, howMany);
            setupTooltip();
            e.stopPropagation();
        });

        $('.less').on('click', function (e) {
            var howMany = 20;
            var pId = '#'+$(this).data().parentQuery;
            var shownHits = $(pId).find('.ghit > g').length;
            var diff = shownHits - 20;
            if (diff < howMany) {
                $.graphIt(pId, shownHits, howMany - shownHits);
                initButtons(pId, howMany - shownHits);
            }
            else {
                $.graphIt(pId, shownHits, -howMany);
                initButtons(pId, -howMany);
            }
            setupTooltip();
            e.stopPropagation();
        });
    };

    SS.init = function () {
        this.$sequence = $('#sequence');
        this.$sequenceFile = $('#sequence-file');
        this.$sequenceControls = $('.sequence-controls');

        this.$sequence.poll();

        SS.blast.init();
    }
}()); //end SS module

function startDrag() {
    $('#dnd-target-marker').removeClass("hidden");
    document.inDrag = true;
}

function inDrag() {
    if (! document.inDrag) {
        startDrag();
    }
}

function endDrag() {
    $('#dnd-target-marker').addClass("hidden");
    document.inDrag = false;
}

$(document).ready(function(){
    SS.init();

    var notification_timeout;

    function _clearNotifications() {
        $('.notifications .active').hide('drop', {direction: 'up'}).removeClass('active');
    }

    function clearNotifications() {
        clearTimeout(notification_timeout);
        _clearNotifications();
    }

    function showNotification(ident) {
        $('#' + ident + '-notification').show('drop', {direction: 'up'}).addClass('active');
        notification_timeout = setTimeout(_clearNotifications, 5000);
    }

    // drag-and-drop code
    $('body').on('dragover', function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        inDrag();
    });

    $('body').on('dragleave', function(evt) {
        if (! $('#dnd-target-marker')[0].dragActive) {
            endDrag();
        }
    });

    var tgtMarker = $('#dnd-target-marker');
    //Timeout approach suggested at http://stackoverflow.com/questions/14392293/javascript-double-file-dragover-event-firing/14392772#14392772
    var withinQueryBox = false;
    tgtMarker.on('dragenter', function(evt) {
        evt.preventDefault();
        withinQueryBox = true;
        setTimeout(function() { withinQueryBox = false; }, 0);

        tgtMarker[0].dragActive = true;
        evt.originalEvent.dataTransfer.dropEffect = 'copy';
        tgtMarker.addClass('drop-target-hover');
        var textarea = $('#sequence')
        if (textarea.val().length > 0){
          $('#dnd-target-marker-text').html('<span style="color:red" class=drag-drop-overwrite>Overwrite</span> existing query sequence file');
        } else {
          $('#dnd-target-marker-text').html('Drop query sequence file here');
        }
    })
    tgtMarker.on('dragover', function(evt) {
        evt.preventDefault();
    });
    tgtMarker.on('dragleave', function(evt) {
      if (! withinQueryBox) {
          $('#dnd-target-marker')[0].dragActive = false;
          $(this).removeClass('drop-target-hover');
      }
      withinQueryBox = false;
    });

    tgtMarker.on('drop', function(evt) {
        // Clear anything leftover from the previously accepted dropped file, to prevent confusion
        var textarea = $('#sequence');
        textarea.val("");

        evt.stopPropagation();
        evt.preventDefault();
        tgtMarker.removeClass('drop-target-hover');
        tgtMarker[0].dragActive = false;
        endDrag();

        var files = evt.originalEvent.dataTransfer.files; // FileList
        if (files.length == 1) {
            var file = files[0];
            if (file.size < 10 * 1048576) {
                var reader = new FileReader();
                reader.onload = (function(file) {
                    return function(e) {
                        var putativeFastaText = e.target.result;
                        // Query file must start with > (possibly after whitespace), or be entirely alphanumeric+whitespace
                        if (/^\s*>/.test(putativeFastaText) || /^\s*[0-9A-Za-z\*]+[\s0-9A-Za-z\*]*$/.test(putativeFastaText)) {
                            var textarea = $('#sequence');
                            textarea.val(putativeFastaText);
                            var indicator = $('#sequence-file');
                            indicator.text(file.name);
                        } else {
                            // apparently not FASTA
                            $('#dnd-format-notification .filename').text(file.name);
                            showNotification('dnd-format');
                        }
                    };
                })(file);
                reader.onerror = (function(file) {
                    return function(e) {
                        $('#dnd-read-error-notification .filename').text(file.name);
                        showNotification('dnd-read-error');
                    }
                })(file);
                reader.readAsText(file);
            } else {
                $('#dnd-large-file-notification .filename').text(file.name);
                showNotification('dnd-large-file');
            }
        } else {
            showNotification('dnd-multi');
        }
    });
    // end drag-and-drop

    SS.$sequence.change(function () {
        if (SS.$sequence.val()) {
            // Calculation below is based on -
            // http://chris-spittles.co.uk/jquery-calculate-scrollbar-width/
            var sequenceControlsRight = SS.$sequence[0].offsetWidth -
                SS.$sequence[0].clientWidth;
            SS.$sequenceControls.css('right', sequenceControlsRight + 17);
            SS.$sequenceControls.removeClass('hidden');
        }
        else {
            SS.$sequenceFile.empty();
            SS.$sequenceControls.addClass('hidden');
        }
    });

    // Handle clearing query sequences(s) when x button is pressed.
    $('#btn-sequence-clear').click(function (e) {
        $('#sequence').val("");
    })

    // pre-select if only on db
    $.onedb();

    // Handles the form submission when Ctrl+Enter is pressed anywhere on page
    $(document).bind("keydown", function (e) {
        if (e.ctrlKey && e.keyCode === 13 && !$('#method').is(':disabled')) {
            $('#method').trigger('submit');
        }
    });

    $('#sequence').on('sequence_type_changed', function (event, type) {
        clearTimeout(notification_timeout);
        $(this).parent().parent().removeClass('has-error');
        $('.notifications .active').hide().removeClass('active');

        if (type) {
            $('#' + type + '-sequence-notification').show('drop', {direction: 'up'}).addClass('active');

            notification_timeout = setTimeout(function () {
                $('.notifications .active').hide('drop', {direction: 'up'}).removeClass('active');
            }, 5000);

            if (type === 'mixed') {
                $(this).parent().parent().addClass('has-error');
            }
        }
    });

    $('body').click(function () {
        $('.notifications .active').hide('drop', {direction: 'up'}).removeClass('active');
    });

    $('.databases').on('database_type_changed', function (event, type) {
        switch (type) {
            case 'protein':
                $('.databases.nucleotide input:checkbox').uncheck().disable();
                break;
            case 'nucleotide':
                $('.databases.protein input:checkbox').uncheck().disable();
                break;
            default:
                $('.databases input:checkbox').enable();
                break;
        }
    });

    $('form').on('blast_method_changed', function (event, methods){
        // reset
        $('#methods .dropdown-menu').html('');
        $('#method').disable().val('').html('blast');
        $('#methods').removeClass('btn-group').children('.dropdown-toggle').hide();

        if (methods) {
            var method = methods.shift();

            $('#method').enable().val(method).html(SS.decorate(method));

            if (methods.length >=1) {
                $('#methods').addClass('btn-group').
                    children('.dropdown-toggle').show();

                var methods_list = $.map(methods, function (method, _) {
                    return "<li>" + SS.decorate(method) + "</li>";
                }).join('');

                $('#methods .dropdown-menu').html(methods_list);
            }

            // jiggle
            $("#methods").effect("bounce", { times:5, direction: 'left', distance: 12 }, 120);
        }
    });

    // The list of possible blast methods is dynamically generated.  So we
    // leverage event bubbling and delegation to trap 'click' event on the list items.
    // Please see : http://api.jquery.com/on/#direct-and-delegated-events

    $(document).on("click", "#methods .dropdown-menu li", function(event) {
        var clicked = $(this);
        var mbutton = $('#method');
        var old_method = mbutton.text();
        var new_method = clicked.text();

        // swap
        clicked.html(SS.decorate(old_method));
        mbutton.val(new_method).html(SS.decorate(new_method));

        // jiggle
        $("#methods").effect("bounce", { times:5, direction: 'left', distance: 12 }, 120);
    });

    $('.result').on('click', "[data-toggle='collapse']", function (event) {
        event.preventDefault();
        $(this).find('.fa').toggleClass('fa-rotate-270');
    });

    $('#fasta').on('change', '.hits-box:checkbox', function(event) {
        var checkboxes = $('.hits-box:checkbox').length,
            checked_boxes = $('.hits-box:checkbox:checked').length,
            container = $('.fasta-download'),
            text = container.html();
        if (checked_boxes > 0 &&
            checked_boxes != checkboxes) {
            container.html(text.replace('all', 'selected'));
        }
        else {
            container.html(text.replace('selected', 'all'));
        }
    });

    $('#fasta').on('click', '.fasta-download', function(event) {
        var sequence_ids = $('.hits-box:checkbox:checked').map(function () {
                return this.value;
            }).get(),
            database_ids = $(this).data().databases;
        // DEBUG
        //console.log(sequence_ids, database_ids);

        if (sequence_ids.length < 1) {
            sequence_ids = $('.hits-box:checkbox').map(function() {
                return this.value;
            }).get();
        }
        var url = "/get_sequence/?sequence_ids=" +
                  sequence_ids.join(' ') + "&database_ids=" + database_ids +
                  "&download=fasta";
        this.href = url;
    });

    $('#blast').submit(function(){
        //parse AJAX URL
        var action = $(this).attr('action');
        var index  = action.indexOf('#');
        var url    = action.slice(0, index);
        var hash   = action.slice(index, action.length);

        // reset hash so we can always _jump_ back to result
        location.hash = '';

        // show activity spinner
        $('#spinner').modal();

        // BLAST now
        var data = ($(this).serialize() + '&method=' + $('#method').val());
        $.post(url, data).
          done(function (data) {
            // BLASTed successfully

            // display the result
            $('.result').html(data).show();

            // affix the index
            var $index = $('.index');
            $index.affix({
                offset: {
                    top: $index.offset().top
                }
            })
            .width($index.width());

            //jump to the results
            location.hash = hash;

            SS.generateGraphicalOverview();

            $('.resultn').
                scrollspy({
                    approach: screen.height / 4
                }).
                on('enter.scrollspy', function () {
                    var id = $(this).attr('id');
                    $(this).highlight();
                    $('.index').find('a[href="#' + id + '"]').parent().highlight();

                    return false;
                }).
                on('leave.scrollspy', function () {
                    var id = $(this).attr('id');
                    $(this).unhighlight();
                    $('.index').find('a[href="#' + id + '"]').parent().unhighlight();

                    return false;
                });

                $('a.link-fasta')
                .on('click', function (event) {
                    event.preventDefault();
                    var clicked = $(event.target);

                    var url = clicked.attr('href');
                    $.get(url)
                    .done(function (sequences) {
                        $('#fasta').html(sequences).modal();
                    })
                    .fail(function (jqXHR, status, error) {
                        //alert user
                        if (jqXHR.responseText) {
                            $("#error").html(jqXHR.responseText).modal();
                        }
                        else {
                            $("#error-no-response").modal();
                        }
                    });
                });
        }).
          fail(function (jqXHR, status, error) {
            //alert user
            if (jqXHR.responseText) {
                $("#error").html(jqXHR.responseText).modal();
            }
            else {
                $("#error-no-response").modal();
            }
        }).
          always(function () {
            // BLAST complete (succefully or otherwise)
            // remove progress notification
            $('#spinner').modal('hide');
        });

        return false;
    });
});

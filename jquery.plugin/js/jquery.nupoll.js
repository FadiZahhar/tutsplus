;(function($) {
    
    var defaults = {
        question: "Which is favourite JavaScript library",
        ajaxOptions: {
            url: "/poll.asmx/updateVotes",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        },
        buttonText: "Answer!",
        categories: ["jQuery", "YUI", "Dojo", "ExtJS", "Zepto"],
        containerClass: "nupoll",
        formClass: "nupoll-form",
        buttonClass: "nupoll-submit",
        errorMessage: "Thanks for your vote, unfortunately there has been an error and the poll results cannot be shown. Please contact the owner of the site or try again later",
        errorClass: "nupoll-error-message",
        animation: "slideIn"
    };

    function Nupoll(element, options) {
        var widget = this;

        widget.config = $.extend(true, {}, defaults, options);
        widget.element = element;

        widget.element.on("submit", function(e) {
            e.preventDefault();
            
            var dataObj = {
                    data: JSON.stringify({ selected: widget.element.find(":checked").val() })
                },
                ajaxSettings = $.extend({}, widget.config.ajaxOptions, dataObj);


            $.ajax(ajaxSettings).done(function(data) {
                widget.element.trigger("afterresponse.nupoll");

                widget.buildChart(data);
            }).fail(function(data) {
                var returnVal = widget.element.triggerHandler("responseerror.nupoll", data);
                
                if(returnVal !== false) {
                    widget.element.append($("<p/>", {
                        text: widget.config.errorMessage,
                        "class": widget.config.errorClass
                    }));
                }
            });

            widget.labels = widget.element.find("label");
            widget.element.width(widget.element.width()).height(widget.element.height()).find("form").remove();

            widget.element.trigger("beforeresponse.nupoll");
        });

        widget.element.one("change", function(e) {
            widget.element.find("button").removeProp("disabled");
        });

        $.each(widget.config, function(key, val) {
            if(typeof val === "function") {
                widget.element.on(key + ".nupoll", function(e, param) {
                    return val(e, widget.element, param);
                });
            }
            
        });

        this.init();
    }

    Nupoll.prototype.init = function() {
        this.element.addClass(this.config.containerClass);

        $("<h1/>", {
            text: this.config.question
        }).appendTo(this.element);

        var form = $("<form/>").addClass(this.config.formClass).appendTo(this.element);

        var x, y;

        for (x = 0, y = this.config.categories.length; x < y; x++) {
            $("<input/>", {
                type: "radio",
                name: "categories",
                id: this.config.categories[x],
                value: this.config.categories[x]
            }).appendTo(form);

            $("<label/>", {
                text: this.config.categories[x],
                "for": this.config.categories[x]
            }).appendTo(form);
        };

        $("<button/>", {
            text: this.config.buttonText,
            "class": this.config.buttonClass,
            disabled: "disabled"
        }).appendTo(form);       
        
        this.element.trigger("created.nupoll");
    }

    Nupoll.prototype.buildChart = function(data) {
        var list = $("<dl/>"),
            def = $("<dd/>"),
            term = $("<dt/>"),
            span = $("<span/>"),
            totalVotes = 0,
            x, y;

        for(x = 0, y = data.length; x < y; x++) {
            totalVotes = totalVotes + data[x].votes;
        }
        
        this.labels.each(function(i, item) {
            var percent = Math.round((data[i].votes / totalVotes) * 100) + "%",
                result = span.clone().width(0).attr("data-percent", percent);

            term.clone().append(item).appendTo(list);
            def.clone().append(result).appendTo(list);
        });

        this.element.append(list); 
        
        this[this.config.animation]();      

    }

    Nupoll.prototype.slideIn = function() {
        var results = this.element.find("span");

        results.each(function() {
            var result = $(this),
                to = result.attr("data-percent");

            result.animate({
                width: to
            }, 400, function() {
                result.text(to);
            })
        });
    }

    Nupoll.prototype.none = function() {
        var results = this.element.find("span");

         results.each(function(i) {
            var result = results.eq(i),
                to = result.attr("data-percent");
                
            result.width(to).text(to);   
         });
    }

    Nupoll.prototype.fade = function() {
        var results = this.element.find("span");

        results.each(function() {
            var result = $(this),
                to = result.attr("data-percent");

            result.width(to).text(to).hide(); 
            result.fadeIn(400);
        });
    }

    $.fn.nupoll = function(options) {
        new Nupoll(this.first(), options);
        return this.first();
    };
}(jQuery));
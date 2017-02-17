# Contributing

Please give [Chris a holler on Bitbucket](https://bitbucket.org/klembot) if you
have a feature you would like to add or a change you'd like to make to existing
functionality, so we can come to agreement on the change itself before you
spend time writing code. Bugfixes don't require discussion, though -- we can
hash things out in the comments of your pull request as needed.

Pull requests should be accompanied by [Selenium IDE
tests](http://docs.seleniumhq.org/projects/ide/) where possible; there are some
things related to uploaded or downloaded files that Selenium isn't able to
test. If you're adding a new JavaScript file, please make sure it has ["use
strict";]() at the top, and passes the `grunt jslint` task, and that methods
and classes are documented properly (we use
[YUIDoc](https://yui.github.io/yuidoc/syntax/) -- use `grunt doc` to regenerate
documentation). 

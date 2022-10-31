#!/bin/sh
set -e
if test "$CONFIGURATION" = "Debug"; then :
  cd /Users/yuxinli/Projects/openGLL/LBMXcode
  make -f /Users/yuxinli/Projects/openGLL/LBMXcode/CMakeScripts/ReRunCMake.make
fi
if test "$CONFIGURATION" = "Release"; then :
  cd /Users/yuxinli/Projects/openGLL/LBMXcode
  make -f /Users/yuxinli/Projects/openGLL/LBMXcode/CMakeScripts/ReRunCMake.make
fi
if test "$CONFIGURATION" = "MinSizeRel"; then :
  cd /Users/yuxinli/Projects/openGLL/LBMXcode
  make -f /Users/yuxinli/Projects/openGLL/LBMXcode/CMakeScripts/ReRunCMake.make
fi
if test "$CONFIGURATION" = "RelWithDebInfo"; then :
  cd /Users/yuxinli/Projects/openGLL/LBMXcode
  make -f /Users/yuxinli/Projects/openGLL/LBMXcode/CMakeScripts/ReRunCMake.make
fi


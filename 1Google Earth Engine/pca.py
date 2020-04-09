# Name: PrincipalComponents_Ex_02.py
# Description: Performs principal components analysis on a set of raster bands.
# Requirements: Spatial Analyst Extension

# Import system modules
import arcpy
from arcpy import env
from arcpy.sa import *

# class LicenseError(Exception):
#     pass

# try:
#     if arcpy.CheckExtension("DataInteroperability") == "Available":
#         arcpy.CheckOutExtension("DataInteroperability")
#         print "Checked out /"DataInteroperability/" Extension"
#     else:
#         raise LicenseError
# except LicenseError:
#     print "Data Interoperability license is unavailable"
# except:
#     print arcpy.GetMessages(2)

# Set environment settings
env.workspace = "H:/muhaowei/1Huanghe/Process/RSEI2"

# Set local variables
inRasterBand1 = "RSEI_Nor1.tif"
inRasterBand2 = "RSEI_Nor2.tif"
inRasterBand3 = "RSEI_Nor3.tif"
inRasterBand4 = "RSEI_Nor4.tif"
numberComponents = 4
outDataFile = "H:/muhaowei/1Huanghe/Process/RSEI2/pcdatafile.txt"

# Check out the ArcGIS Spatial Analyst extension license
# arcpy.checkOutExtension("Spatial")

# Execute PrincipalComponents
outPrincipalComp = PrincipalComponents([inRasterBand1, inRasterBand2, inRasterBand3, inRasterBand4], 4,
                                       outDataFile)

# Save the output 
outPrincipalComp.save("H:/muhaowei/1Huanghe/Process/RSEI2/outpc01")
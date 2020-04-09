# Name: CostPath_Ex_02.py
# Description: Calculates the least-cost path from a source to 
#              a destination.
# Requirements: Spatial Analyst Extension

# Import system modules
import arcpy
from arcpy import env
from arcpy.sa import *

# Set environment settings
env.workspace = "H:/muhaowei/1TheGreatGeenWall/Shapefile/Ecological/CostPloy/"
for i in range(19):
    print str(i)+'.shp'
    # Set local variables
    inDestination = "H:/muhaowei/1TheGreatGeenWall/Shapefile/Ecological/Target/"+str(i)+".shp"
    costRaster = "outcostdist"+str(i)+".tif"
    backLink = "outbklink"+str(i)+".tif"
    method = "EACH_CELL"
    destField = "ID"

    # Check out the ArcGIS Spatial Analyst extension license
    # arcpy.CheckOutExtension("Spatial")

    # Execute CostPath
    outCostPath = CostPath(inDestination, costRaster, backLink, method, destField)

    # Save the output 
    outCostPath.save("H:/muhaowei/1TheGreatGeenWall/Shapefile/Ecological/CostPath/outcostdist"+str(i)+".tif")
    print 'OK'
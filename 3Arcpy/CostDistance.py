# Name: CostDistance_Ex_02.py
# Description: Calculates for each cell the least accumulative cost distance
#    to the nearest source over a cost  surface. 
# Requirements: Spatial Analyst Extension

# Import system modules
import arcpy
from arcpy import env
from arcpy.sa import *

# Set environment settings
env.workspace = "H:/muhaowei/1TheGreatGeenWall"
for i in range(19):
    print str(i)+'.shp'
    # Set local variables
    inSourceData = "H:/muhaowei/1TheGreatGeenWall/Shapefile/Ecological/Source/"+str(i)+".shp"
    inCostRaster = "CostFinally_250.tif"
    maxDistance = None   
    outBkLinkRaster = "H:/muhaowei/1TheGreatGeenWall/Shapefile/Ecological/CostPloy/outbklink"+str(i)+".tif"

    # Check out the ArcGIS Spatial Analyst extension license
    # arcpy.CheckOutExtension("Spatial")

    # Execute CostDistance
    arcpy.env.extent = arcpy.Extent(8186566.944989, 6477757.919322, 14276766.944989, 4043957.919322)
    arcpy.env.mask = "H:/muhaowei/1TheGreatGeenWall/CostFinally.tif"
    outCostDistance = CostDistance(inSourceData, inCostRaster, maxDistance, outBkLinkRaster)

    # Save the output 
    outCostDistance.save("H:/muhaowei/1TheGreatGeenWall/Shapefile/Ecological/CostPloy/outcostdist"+str(i)+".tif")
    print 'OK'